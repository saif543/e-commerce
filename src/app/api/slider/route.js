// Slider API - Firebase Token Authentication
// Hero carousel management with enterprise security
import { NextResponse } from 'next/server'
import { verifyApiToken, requireRole, createAuthError, checkRateLimit } from '@/lib/auth'
import { uploadImage, deleteImage } from '@/lib/cloudinary'
import clientPromise from '@/lib/mongodb'

// ============================================================
// 🔐 SECURITY CONSTANTS
// ============================================================
const MAX_IMAGE_SIZE_ADMIN = 100 * 1024 * 1024   // 100MB
const MAX_IMAGE_SIZE_USER = 5 * 1024 * 1024   // 5MB
const MAX_REQUEST_BODY_SIZE = 20_000              // 20KB for slider JSON
const MAX_TITLE_LENGTH = 150
const MAX_SUBTITLE_LENGTH = 300
const MAX_CTA_TEXT_LENGTH = 60
const MAX_CTA_LINK_LENGTH = 500

// IP-based upload tracking
const uploadTracker = new Map()
const UPLOAD_LIMIT_PER_HOUR = 20
const UPLOAD_WINDOW_MS = 60 * 60 * 1000

// Write rate limiting
const writeRequestCounts = new Map()
const WRITE_RATE_LIMIT = 20
const WRITE_WINDOW_MS = 15 * 60 * 1000

const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg']

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

function isValidUrl(url) {
    if (!url) return true // CTA link is optional
    try { new URL(url.startsWith('/') ? `https://example.com${url}` : url); return true }
    catch { return false }
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
// 📦 GET — Get all active sliders (Public, sorted by order)
// ============================================================
export async function GET(req) {
    try {
        await checkRateLimit(req)

        const { searchParams } = new URL(req.url)
        const includeInactive = searchParams.get('includeInactive') === 'true'

        const client = await clientPromise
        const db = client.db('ECOM')

        // Only admin can request inactive sliders (token needed)
        let query = { isActive: true }
        if (includeInactive) {
            try {
                const user = await verifyApiToken(req)
                requireRole(user, ['admin'])
                query = {} // Show all
            } catch {
                query = { isActive: true } // Fall back to active only
            }
        }

        const sliders = await db.collection('sliders').find(query).sort({ order: 1 }).toArray()
        return NextResponse.json({ sliders })

    } catch (err) {
        console.error('❌ GET /api/slider error:', err)
        return NextResponse.json({
            error: 'Failed to fetch sliders',
            details: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error',
        }, { status: 500 })
    }
}

// ============================================================
// ➕ POST — Create slider with image upload (Admin only)
// ============================================================
export async function POST(req) {
    let user = null
    try {
        await checkRateLimit(req)
        checkWriteRateLimit(req)
        checkUploadRateLimit(req)
        user = await verifyApiToken(req)
        requireRole(user, ['admin'])
    } catch (authErr) {
        return createAuthError(authErr.message, authErr.message.includes('rate') ? 429 : 401)
    }

    try {
        const formData = await req.formData()
        const file = formData.get('image')
        const title = sanitizeString(formData.get('title') || '', MAX_TITLE_LENGTH)
        const subtitle = sanitizeString(formData.get('subtitle') || '', MAX_SUBTITLE_LENGTH)
        const ctaText = sanitizeString(formData.get('ctaText') || '', MAX_CTA_TEXT_LENGTH)
        const ctaLink = sanitizeString(formData.get('ctaLink') || '', MAX_CTA_LINK_LENGTH)
        const order = parseInt(formData.get('order') || '0', 10)
        const isActive = formData.get('isActive') !== 'false'

        // Validations
        if (!title) return NextResponse.json({ error: 'Slide title is required' }, { status: 400 })
        if (!file) return NextResponse.json({ error: 'Slide image is required' }, { status: 400 })
        if (!isValidUrl(ctaLink)) return NextResponse.json({ error: 'Invalid CTA link URL' }, { status: 400 })
        if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
            return NextResponse.json({ error: 'Invalid image type. Allowed: JPEG, PNG, WebP' }, { status: 400 })
        }
        const maxSize = user.role === 'admin' ? MAX_IMAGE_SIZE_ADMIN : MAX_IMAGE_SIZE_USER
        if (file.size > maxSize) {
            return NextResponse.json({ error: `Image too large (max ${user.role === 'admin' ? '100MB' : '5MB'})` }, { status: 400 })
        }

        // Upload to Cloudinary
        const buffer = Buffer.from(await file.arrayBuffer())
        const uploaded = await uploadImage(buffer, {
            folder: 'ecom/sliders',
            publicId: `slider_${Date.now()}`,
            transformation: [{ width: 1920, height: 800, crop: 'fill' }],
        })

        const client = await clientPromise
        const db = client.db('ECOM')
        const newSlider = {
            title, subtitle, ctaText, ctaLink,
            image: { url: uploaded.url, publicId: uploaded.publicId },
            order: isNaN(order) ? 0 : order,
            isActive,
            createdBy: user.dbUserId || user.userId,
            createdAt: new Date(),
            updatedAt: new Date(),
        }

        const result = await db.collection('sliders').insertOne(newSlider)
        const created = await db.collection('sliders').findOne({ _id: result.insertedId })

        logAudit('SLIDER_CREATED', { userId: user.userId, userEmail: user.email, sliderId: result.insertedId.toString() }, req)
        return NextResponse.json({ message: 'Slider created successfully', slider: created }, { status: 201 })

    } catch (err) {
        console.error('❌ POST /api/slider error:', err)
        return NextResponse.json({
            error: 'Failed to create slider',
            details: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error',
        }, { status: 500 })
    }
}

// ============================================================
// ✏️ PUT — Update slider text, order, or image (Admin only)
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
            // Image replacement request
            checkUploadRateLimit(req)
            const formData = await req.formData()
            id = formData.get('id')
            const file = formData.get('image')

            if (!id) return NextResponse.json({ error: 'Slider id is required' }, { status: 400 })

            if (formData.get('title')) updateData.title = sanitizeString(formData.get('title'), MAX_TITLE_LENGTH)
            if (formData.get('subtitle')) updateData.subtitle = sanitizeString(formData.get('subtitle'), MAX_SUBTITLE_LENGTH)
            if (formData.get('ctaText')) updateData.ctaText = sanitizeString(formData.get('ctaText'), MAX_CTA_TEXT_LENGTH)
            if (formData.get('ctaLink')) updateData.ctaLink = sanitizeString(formData.get('ctaLink'), MAX_CTA_LINK_LENGTH)
            if (formData.get('order') !== null) updateData.order = parseInt(formData.get('order'), 10)
            if (formData.get('isActive') !== null) updateData.isActive = formData.get('isActive') !== 'false'

            if (file) {
                if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
                    return NextResponse.json({ error: 'Invalid image type' }, { status: 400 })
                }
                const maxSize = user.role === 'admin' ? MAX_IMAGE_SIZE_ADMIN : MAX_IMAGE_SIZE_USER
                if (file.size > maxSize) {
                    return NextResponse.json({ error: 'Image too large' }, { status: 400 })
                }
                const client = await clientPromise
                const db = client.db('ECOM')
                let oid
                try { oid = new ObjectId(sanitizeString(id, 100)) } catch {
                    return NextResponse.json({ error: 'Invalid id' }, { status: 400 })
                }
                const slider = await db.collection('sliders').findOne({ _id: oid })
                if (slider?.image?.publicId) await deleteImage(slider.image.publicId)

                const buffer = Buffer.from(await file.arrayBuffer())
                const uploaded = await uploadImage(buffer, {
                    folder: 'ecom/sliders',
                    publicId: `slider_${id}_${Date.now()}`,
                    transformation: [{ width: 1920, height: 800, crop: 'fill' }],
                })
                updateData.image = { url: uploaded.url, publicId: uploaded.publicId }
            }
        } else {
            const contentLength = parseInt(req.headers.get('content-length') || '0', 10)
            if (contentLength > MAX_REQUEST_BODY_SIZE) {
                return NextResponse.json({ error: 'Request body too large' }, { status: 413 })
            }
            const body = await req.json()
            id = body.id
            if (!id) return NextResponse.json({ error: 'Slider id is required' }, { status: 400 })
            if (body.title !== undefined) updateData.title = sanitizeString(body.title, MAX_TITLE_LENGTH)
            if (body.subtitle !== undefined) updateData.subtitle = sanitizeString(body.subtitle, MAX_SUBTITLE_LENGTH)
            if (body.ctaText !== undefined) updateData.ctaText = sanitizeString(body.ctaText, MAX_CTA_TEXT_LENGTH)
            if (body.ctaLink !== undefined) {
                if (!isValidUrl(body.ctaLink)) return NextResponse.json({ error: 'Invalid CTA link URL' }, { status: 400 })
                updateData.ctaLink = sanitizeString(body.ctaLink, MAX_CTA_LINK_LENGTH)
            }
            if (body.order !== undefined) updateData.order = parseInt(body.order, 10)
            if (body.isActive !== undefined) updateData.isActive = Boolean(body.isActive)
        }

        updateData.updatedAt = new Date()

        const client = await clientPromise
        const db = client.db('ECOM')
        let oid
        try { oid = new ObjectId(sanitizeString(id, 100)) } catch {
            return NextResponse.json({ error: 'Invalid id format' }, { status: 400 })
        }

        const slider = await db.collection('sliders').findOne({ _id: oid })
        if (!slider) return NextResponse.json({ error: 'Slider not found' }, { status: 404 })

        await db.collection('sliders').updateOne({ _id: oid }, { $set: updateData })
        const updated = await db.collection('sliders').findOne({ _id: oid })

        logAudit('SLIDER_UPDATED', { userId: user.userId, userEmail: user.email, sliderId: id, updatedFields: Object.keys(updateData) }, req)
        return NextResponse.json({ message: 'Slider updated successfully', slider: updated }, { status: 200 })

    } catch (err) {
        console.error('❌ PUT /api/slider error:', err)
        return NextResponse.json({
            error: 'Failed to update slider',
            details: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error',
        }, { status: 500 })
    }
}

// ============================================================
// 🗑️ DELETE — Delete slider + Cloudinary image (Admin only)
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

        if (!id) return NextResponse.json({ error: 'Slider id is required' }, { status: 400 })

        let oid
        try { oid = new ObjectId(id) } catch {
            return NextResponse.json({ error: 'Invalid id format' }, { status: 400 })
        }

        const client = await clientPromise
        const db = client.db('ECOM')
        const slider = await db.collection('sliders').findOne({ _id: oid })
        if (!slider) return NextResponse.json({ error: 'Slider not found' }, { status: 404 })

        // Remove Cloudinary image
        if (slider.image?.publicId) await deleteImage(slider.image.publicId)

        await db.collection('sliders').deleteOne({ _id: oid })

        logAudit('SLIDER_DELETED', { userId: user.userId, userEmail: user.email, sliderId: id, title: slider.title }, req)
        return NextResponse.json({ message: 'Slider deleted successfully' }, { status: 200 })

    } catch (err) {
        console.error('❌ DELETE /api/slider error:', err)
        return NextResponse.json({
            error: 'Failed to delete slider',
            details: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error',
        }, { status: 500 })
    }
}
