// Brand API - Firebase Token Authentication
// Brand management (name + logo) with enterprise security
import { NextResponse } from 'next/server'
import { verifyApiToken, requireRole, createAuthError, checkRateLimit } from '@/lib/auth'
import { uploadImage, deleteImage } from '@/lib/cloudinary'
import clientPromise from '@/lib/mongodb'

// ============================================================
// 🔐 SECURITY CONSTANTS
// ============================================================
const MAX_IMAGE_SIZE_ADMIN = 100 * 1024 * 1024
const MAX_IMAGE_SIZE_USER = 5 * 1024 * 1024
const MAX_BRAND_NAME_LENGTH = 100
const MAX_REQUEST_BODY_SIZE = 10_000 // 10KB

// IP upload tracking
const uploadTracker = new Map()
const UPLOAD_LIMIT_PER_HOUR = 30
const UPLOAD_WINDOW_MS = 60 * 60 * 1000

// Write rate limit
const writeRequestCounts = new Map()
const WRITE_RATE_LIMIT = 30
const WRITE_WINDOW_MS = 15 * 60 * 1000

const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg', 'image/svg+xml']

// ============================================================
// 🛡️ SECURITY HELPERS
// ============================================================
function getClientIP(req) {
    return req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
        req.headers.get('x-real-ip') || 'unknown'
}

function checkUploadRateLimit(req) {
    const ip = getClientIP(req)
    const now = Date.now()
    const tracker = uploadTracker.get(ip) || { count: 0, windowStart: now }
    if (tracker.windowStart < now - UPLOAD_WINDOW_MS) { tracker.count = 1; tracker.windowStart = now }
    else tracker.count++
    uploadTracker.set(ip, tracker)
    if (tracker.count > UPLOAD_LIMIT_PER_HOUR) throw new Error('Upload rate limit exceeded')
}

function checkWriteRateLimit(req) {
    const ip = getClientIP(req)
    const now = Date.now()
    const current = writeRequestCounts.get(ip) || { count: 0, timestamp: now }
    if (current.timestamp < now - WRITE_WINDOW_MS) { current.count = 1; current.timestamp = now }
    else current.count++
    writeRequestCounts.set(ip, current)
    if (current.count > WRITE_RATE_LIMIT) throw new Error('Too many write requests')
}

function sanitizeString(value, maxLength = 200) {
    if (typeof value !== 'string') return null
    return value.trim()
        .replace(/<[^>]*>/g, '')
        .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '')
        .slice(0, maxLength)
}

function generateSlug(name) {
    return name.toLowerCase().trim()
        .replace(/[^\w\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-|-$/g, '')
}

async function logAudit(action, data, req) {
    setImmediate(async () => {
        try {
            const client = await clientPromise
            await client.db('ECOM').collection('audit_logs').insertOne({
                action, ...data, timestamp: new Date(), ipAddress: getClientIP(req),
            })
        } catch (err) { console.error('Audit log error:', err) }
    })
}

// ============================================================
// 📦 GET — List all active brands (Public)
// ============================================================
export async function GET(req) {
    try {
        await checkRateLimit(req)

        const { searchParams } = new URL(req.url)
        const id = searchParams.get('id')
        const includeInactive = searchParams.get('includeInactive') === 'true'

        const client = await clientPromise
        const db = client.db('ECOM')

        if (id) {
            const { ObjectId } = await import('mongodb')
            const sanitizedId = sanitizeString(id, 100)
            let brand
            if (sanitizedId.length === 24 && /^[a-f0-9]+$/i.test(sanitizedId)) {
                try { brand = await db.collection('brands').findOne({ _id: new ObjectId(sanitizedId) }) } catch { }
            }
            if (!brand) brand = await db.collection('brands').findOne({ slug: sanitizedId })
            if (!brand) return NextResponse.json({ error: 'Brand not found' }, { status: 404 })
            return NextResponse.json({ brand })
        }

        let query = { isActive: true }
        if (includeInactive) {
            try {
                const user = await verifyApiToken(req)
                requireRole(user, ['admin'])
                query = {}
            } catch { query = { isActive: true } }
        }

        const brands = await db.collection('brands').find(query).sort({ name: 1 }).toArray()
        return NextResponse.json({ brands })

    } catch (err) {
        console.error('❌ GET /api/brand error:', err)
        return NextResponse.json({
            error: 'Failed to fetch brands',
            details: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error',
        }, { status: 500 })
    }
}

// ============================================================
// ➕ POST — Create brand + logo upload (Admin only)
// ============================================================
export async function POST(req) {
    let user = null
    try {
        await checkRateLimit(req)
        checkWriteRateLimit(req)
        user = await verifyApiToken(req)
        requireRole(user, ['admin'])
    } catch (authErr) {
        return createAuthError(authErr.message, authErr.message.includes('rate') ? 429 : 401)
    }

    try {
        const contentType = req.headers.get('content-type') || ''
        let name, logoFile

        if (contentType.includes('multipart/form-data')) {
            checkUploadRateLimit(req)
            const formData = await req.formData()
            name = sanitizeString(formData.get('name') || '', MAX_BRAND_NAME_LENGTH)
            logoFile = formData.get('logo')
        } else {
            const contentLength = parseInt(req.headers.get('content-length') || '0', 10)
            if (contentLength > MAX_REQUEST_BODY_SIZE) {
                return NextResponse.json({ error: 'Request body too large' }, { status: 413 })
            }
            const body = await req.json()
            name = sanitizeString(body.name || '', MAX_BRAND_NAME_LENGTH)
        }

        if (!name || name.length < 1) {
            return NextResponse.json({ error: 'Brand name is required (min 1 char)' }, { status: 400 })
        }

        const client = await clientPromise
        const db = client.db('ECOM')

        // Check uniqueness
        const slug = generateSlug(name)
        const existing = await db.collection('brands').findOne({ $or: [{ slug }, { name: { $regex: `^${name}$`, $options: 'i' } }] })
        if (existing) return NextResponse.json({ error: `Brand "${name}" already exists` }, { status: 409 })

        // Upload logo if provided
        let logo = null
        if (logoFile) {
            if (!ALLOWED_IMAGE_TYPES.includes(logoFile.type)) {
                return NextResponse.json({ error: 'Invalid logo type. Allowed: JPEG, PNG, WebP, SVG' }, { status: 400 })
            }
            const maxSize = user.role === 'admin' ? MAX_IMAGE_SIZE_ADMIN : MAX_IMAGE_SIZE_USER
            if (logoFile.size > maxSize) {
                return NextResponse.json({ error: 'Logo file too large' }, { status: 400 })
            }
            const buffer = Buffer.from(await logoFile.arrayBuffer())
            const uploaded = await uploadImage(buffer, {
                folder: 'ecom/brands',
                publicId: `brand_${slug}_${Date.now()}`,
                transformation: [{ width: 400, height: 400, crop: 'fill' }],
            })
            logo = { url: uploaded.url, publicId: uploaded.publicId }
        }

        const newBrand = {
            name, slug, logo, isActive: true,
            createdBy: user.dbUserId || user.userId,
            createdAt: new Date(), updatedAt: new Date(),
        }

        const result = await db.collection('brands').insertOne(newBrand)
        const created = await db.collection('brands').findOne({ _id: result.insertedId })

        logAudit('BRAND_CREATED', { userId: user.userId, userEmail: user.email, brandId: result.insertedId.toString(), name }, req)
        return NextResponse.json({ message: 'Brand created successfully', brand: created }, { status: 201 })

    } catch (err) {
        console.error('❌ POST /api/brand error:', err)
        return NextResponse.json({
            error: 'Failed to create brand',
            details: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error',
        }, { status: 500 })
    }
}

// ============================================================
// ✏️ PUT — Update brand name / logo (Admin only)
// ============================================================
export async function PUT(req) {
    let user = null
    try {
        await checkRateLimit(req)
        checkWriteRateLimit(req)
        user = await verifyApiToken(req)
        requireRole(user, ['admin'])
    } catch (authErr) {
        return createAuthError(authErr.message, authErr.message.includes('rate') ? 429 : 401)
    }

    try {
        const { ObjectId } = await import('mongodb')
        const contentType = req.headers.get('content-type') || ''
        const isFormData = contentType.includes('multipart/form-data')
        let id, updateData = {}

        if (isFormData) {
            checkUploadRateLimit(req)
            const formData = await req.formData()
            id = formData.get('id')
            if (!id) return NextResponse.json({ error: 'Brand id is required' }, { status: 400 })

            if (formData.get('name')) updateData.name = sanitizeString(formData.get('name'), MAX_BRAND_NAME_LENGTH)
            if (formData.get('isActive') !== null) updateData.isActive = formData.get('isActive') !== 'false'

            const logoFile = formData.get('logo')
            if (logoFile) {
                if (!ALLOWED_IMAGE_TYPES.includes(logoFile.type)) {
                    return NextResponse.json({ error: 'Invalid logo type' }, { status: 400 })
                }
                const maxSize = user.role === 'admin' ? MAX_IMAGE_SIZE_ADMIN : MAX_IMAGE_SIZE_USER
                if (logoFile.size > maxSize) return NextResponse.json({ error: 'Logo too large' }, { status: 400 })

                let oid
                try { oid = new ObjectId(sanitizeString(id, 100)) } catch {
                    return NextResponse.json({ error: 'Invalid id' }, { status: 400 })
                }
                const client = await clientPromise
                const db = client.db('ECOM')
                const brand = await db.collection('brands').findOne({ _id: oid })
                if (brand?.logo?.publicId) await deleteImage(brand.logo.publicId)

                const buffer = Buffer.from(await logoFile.arrayBuffer())
                const uploaded = await uploadImage(buffer, {
                    folder: 'ecom/brands',
                    publicId: `brand_${id}_${Date.now()}`,
                    transformation: [{ width: 400, height: 400, crop: 'fill' }],
                })
                updateData.logo = { url: uploaded.url, publicId: uploaded.publicId }
            }
        } else {
            const contentLength = parseInt(req.headers.get('content-length') || '0', 10)
            if (contentLength > MAX_REQUEST_BODY_SIZE) return NextResponse.json({ error: 'Request body too large' }, { status: 413 })
            const body = await req.json()
            id = body.id
            if (!id) return NextResponse.json({ error: 'Brand id is required' }, { status: 400 })
            if (body.name !== undefined) updateData.name = sanitizeString(body.name, MAX_BRAND_NAME_LENGTH)
            if (body.isActive !== undefined) updateData.isActive = Boolean(body.isActive)
        }

        if (updateData.name) updateData.slug = generateSlug(updateData.name)
        updateData.updatedAt = new Date()

        const client = await clientPromise
        const db = client.db('ECOM')
        let oid
        try { oid = new ObjectId(sanitizeString(id, 100)) } catch {
            return NextResponse.json({ error: 'Invalid id format' }, { status: 400 })
        }

        const brand = await db.collection('brands').findOne({ _id: oid })
        if (!brand) return NextResponse.json({ error: 'Brand not found' }, { status: 404 })

        // Check name uniqueness if changing name
        if (updateData.name && updateData.name.toLowerCase() !== brand.name.toLowerCase()) {
            const nameConflict = await db.collection('brands').findOne({
                name: { $regex: `^${updateData.name}$`, $options: 'i' }, _id: { $ne: oid },
            })
            if (nameConflict) return NextResponse.json({ error: `Brand name "${updateData.name}" already exists` }, { status: 409 })
        }

        await db.collection('brands').updateOne({ _id: oid }, { $set: updateData })
        const updated = await db.collection('brands').findOne({ _id: oid })

        logAudit('BRAND_UPDATED', { userId: user.userId, userEmail: user.email, brandId: id, updatedFields: Object.keys(updateData) }, req)
        return NextResponse.json({ message: 'Brand updated successfully', brand: updated }, { status: 200 })

    } catch (err) {
        console.error('❌ PUT /api/brand error:', err)
        return NextResponse.json({
            error: 'Failed to update brand',
            details: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error',
        }, { status: 500 })
    }
}

// ============================================================
// 🗑️ DELETE — Delete brand (Admin only, blocks if products exist)
// ============================================================
export async function DELETE(req) {
    let user = null
    try {
        await checkRateLimit(req)
        checkWriteRateLimit(req)
        user = await verifyApiToken(req)
        requireRole(user, ['admin'])
    } catch (authErr) {
        return createAuthError(authErr.message, authErr.message.includes('rate') ? 429 : 401)
    }

    try {
        const { ObjectId } = await import('mongodb')
        const { searchParams } = new URL(req.url)
        const id = sanitizeString(searchParams.get('id') || '', 100)
        const force = searchParams.get('force') === 'true'

        if (!id) return NextResponse.json({ error: 'Brand id is required' }, { status: 400 })

        let oid
        try { oid = new ObjectId(id) } catch {
            return NextResponse.json({ error: 'Invalid id format' }, { status: 400 })
        }

        const client = await clientPromise
        const db = client.db('ECOM')
        const brand = await db.collection('brands').findOne({ _id: oid })
        if (!brand) return NextResponse.json({ error: 'Brand not found' }, { status: 404 })

        // Safety check: block deletion if products reference this brand
        if (!force) {
            const productCount = await db.collection('products').countDocuments({ brand: { $regex: `^${brand.name}$`, $options: 'i' }, isActive: true })
            if (productCount > 0) {
                return NextResponse.json({
                    error: `Cannot delete brand — ${productCount} active product(s) reference it. Use ?force=true to override, or reassign those products first.`,
                    productCount,
                }, { status: 400 })
            }
        }

        // Delete Cloudinary logo
        if (brand.logo?.publicId) await deleteImage(brand.logo.publicId)

        await db.collection('brands').deleteOne({ _id: oid })

        logAudit('BRAND_DELETED', { userId: user.userId, userEmail: user.email, brandId: id, name: brand.name }, req)
        return NextResponse.json({ message: 'Brand deleted successfully' }, { status: 200 })

    } catch (err) {
        console.error('❌ DELETE /api/brand error:', err)
        return NextResponse.json({
            error: 'Failed to delete brand',
            details: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error',
        }, { status: 500 })
    }
}
