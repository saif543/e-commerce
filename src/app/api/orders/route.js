// Orders API - Firebase Token Authentication
// User order management with enterprise security
import { NextResponse } from 'next/server'
import { verifyApiToken, requireRole, createAuthError, checkRateLimit } from '@/lib/auth'
import clientPromise from '@/lib/mongodb'

// 🔐 SECURITY CONSTANTS
const MAX_REQUEST_BODY_SIZE = 50_000
const MAX_ITEMS_PER_ORDER = 100
const MAX_QUANTITY_PER_ITEM = 999
const MAX_ADDRESS_LENGTH = 500

const writeRequestCounts = new Map()
const WRITE_RATE_LIMIT = 20
const WRITE_WINDOW_MS = 15 * 60 * 1000

const VALID_ORDER_STATUSES = ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded']
const VALID_PAYMENT_METHODS = ['bkash', 'nagad', 'rocket', 'card', 'cash_on_delivery', 'bank_transfer']

function getClientIP(req) {
    return req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || req.headers.get('x-real-ip') || 'unknown'
}

function checkWriteRateLimit(req) {
    const ip = getClientIP(req)
    const now = Date.now()
    const current = writeRequestCounts.get(ip) || { count: 0, timestamp: now }
    if (current.timestamp < now - WRITE_WINDOW_MS) { current.count = 1; current.timestamp = now }
    else current.count++
    writeRequestCounts.set(ip, current)
    if (current.count > WRITE_RATE_LIMIT) throw new Error('Too many requests')
}

function sanitizeString(value, maxLength = 200) {
    if (typeof value !== 'string') return null
    return value.trim().replace(/<[^>]*>/g, '').replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '').slice(0, maxLength)
}

function isValidPrice(price) {
    return typeof price === 'number' && isFinite(price) && price >= 0
}

async function logAudit(action, data, req) {
    setImmediate(async () => {
        try {
            const client = await clientPromise
            await client.db('ECOM').collection('audit_logs').insertOne({ action, ...data, timestamp: new Date(), ipAddress: getClientIP(req) })
        } catch (err) { console.error('Audit log error:', err) }
    })
}

function sanitizeAddress(addr) {
    if (!addr || typeof addr !== 'object') return null
    return {
        fullName: sanitizeString(addr.fullName || '', 100),
        phone: sanitizeString(addr.phone || '', 20),
        addressLine1: sanitizeString(addr.addressLine1 || '', MAX_ADDRESS_LENGTH),
        addressLine2: sanitizeString(addr.addressLine2 || '', MAX_ADDRESS_LENGTH),
        city: sanitizeString(addr.city || '', 100),
        state: sanitizeString(addr.state || '', 100),
        postalCode: sanitizeString(addr.postalCode || '', 20),
        country: sanitizeString(addr.country || 'Bangladesh', 100),
    }
}

function sanitizeItems(items) {
    if (!Array.isArray(items) || items.length === 0 || items.length > MAX_ITEMS_PER_ORDER) return null
    return items.map(item => {
        const productId = sanitizeString(String(item.productId || ''), 100)
        const name = sanitizeString(String(item.name || ''), 300)
        const price = parseFloat(item.price)
        const quantity = parseInt(item.quantity, 10)
        const image = sanitizeString(String(item.image || ''), 500)
        if (!productId || !name || !isValidPrice(price) || isNaN(quantity) || quantity < 1 || quantity > MAX_QUANTITY_PER_ITEM) return null
        return { productId, name, price, quantity, image }
    }).filter(Boolean)
}

// GET — own orders for user, all orders for admin
export async function GET(req) {
    let user = null
    try {
        await checkRateLimit(req)
        user = await verifyApiToken(req)
    } catch (authErr) { return createAuthError(authErr.message, 401) }

    try {
        const { searchParams } = new URL(req.url)
        const getAllOrders = searchParams.get('getAllOrders') === 'true'
        const orderId = sanitizeString(searchParams.get('id') || '', 100)
        const status = searchParams.get('status')
        let page = Math.max(1, parseInt(searchParams.get('page') || '1', 10))
        let limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '20', 10)))

        const client = await clientPromise
        const db = client.db('ECOM')
        const { ObjectId } = await import('mongodb')

        if (orderId) {
            let oid
            try { oid = new ObjectId(orderId) } catch { return NextResponse.json({ error: 'Invalid order id' }, { status: 400 }) }
            const order = await db.collection('orders').findOne({ _id: oid })
            if (!order) return NextResponse.json({ error: 'Order not found' }, { status: 404 })
            if (user.role !== 'admin' && order.userEmail !== user.email) return createAuthError('Access denied', 403)
            return NextResponse.json({ order })
        }

        if (getAllOrders) {
            try { requireRole(user, ['admin']) } catch { return createAuthError('Admin access required', 403) }
            const query = {}
            if (status && VALID_ORDER_STATUSES.includes(status)) query.status = status
            const skip = (page - 1) * limit
            const [orders, total] = await Promise.all([
                db.collection('orders').find(query).skip(skip).limit(limit).sort({ createdAt: -1 }).toArray(),
                db.collection('orders').countDocuments(query),
            ])
            return NextResponse.json({ orders, pagination: { total, page, limit, totalPages: Math.ceil(total / limit) } })
        }

        const query = { userEmail: user.email }
        if (status && VALID_ORDER_STATUSES.includes(status)) query.status = status
        const skip = (page - 1) * limit
        const [orders, total] = await Promise.all([
            db.collection('orders').find(query).skip(skip).limit(limit).sort({ createdAt: -1 }).toArray(),
            db.collection('orders').countDocuments(query),
        ])
        return NextResponse.json({ orders, pagination: { total, page, limit, totalPages: Math.ceil(total / limit) } })

    } catch (err) {
        console.error('❌ GET /api/orders error:', err)
        return NextResponse.json({ error: 'Failed to fetch orders', details: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error' }, { status: 500 })
    }
}

// POST — place new order
export async function POST(req) {
    let user = null
    try {
        await checkRateLimit(req)
        checkWriteRateLimit(req)
        user = await verifyApiToken(req)
    } catch (authErr) { return createAuthError(authErr.message, authErr.message.includes('rate') ? 429 : 401) }

    try {
        const contentLength = parseInt(req.headers.get('content-length') || '0', 10)
        if (contentLength > MAX_REQUEST_BODY_SIZE) return NextResponse.json({ error: 'Request body too large' }, { status: 413 })

        const body = await req.json()
        const items = sanitizeItems(body.items)
        if (!items || items.length === 0) return NextResponse.json({ error: 'Valid items are required' }, { status: 400 })

        const shippingAddress = sanitizeAddress(body.shippingAddress)
        if (!shippingAddress?.fullName || !shippingAddress?.addressLine1 || !shippingAddress?.city) {
            return NextResponse.json({ error: 'Valid shipping address required (fullName, addressLine1, city)' }, { status: 400 })
        }

        if (!body.paymentMethod || !VALID_PAYMENT_METHODS.includes(body.paymentMethod)) {
            return NextResponse.json({ error: `Valid payment method required: ${VALID_PAYMENT_METHODS.join(', ')}` }, { status: 400 })
        }

        // Calculate total SERVER-SIDE — never trust client total
        const totalAmount = parseFloat(items.reduce((sum, item) => sum + item.price * item.quantity, 0).toFixed(2))

        const client = await clientPromise
        const db = client.db('ECOM')
        const newOrder = {
            userId: user.dbUserId || user.userId,
            userEmail: user.email,
            userName: user.name || '',
            items, totalAmount, shippingAddress,
            paymentMethod: body.paymentMethod,
            status: 'pending',
            notes: sanitizeString(body.notes || '', 500),
            createdAt: new Date(), updatedAt: new Date(),
        }

        const result = await db.collection('orders').insertOne(newOrder)
        const created = await db.collection('orders').findOne({ _id: result.insertedId })

        logAudit('ORDER_PLACED', { userId: user.userId, userEmail: user.email, orderId: result.insertedId.toString(), totalAmount, itemCount: items.length }, req)
        return NextResponse.json({ message: 'Order placed successfully', order: created }, { status: 201 })

    } catch (err) {
        console.error('❌ POST /api/orders error:', err)
        return NextResponse.json({ error: 'Failed to place order', details: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error' }, { status: 500 })
    }
}

// PUT — update order status (admin only)
export async function PUT(req) {
    let user = null
    try {
        await checkRateLimit(req)
        checkWriteRateLimit(req)
        user = await verifyApiToken(req)
        requireRole(user, ['admin'])
    } catch (authErr) { return createAuthError(authErr.message, authErr.message.includes('rate') ? 429 : 401) }

    try {
        const contentLength = parseInt(req.headers.get('content-length') || '0', 10)
        if (contentLength > 10_000) return NextResponse.json({ error: 'Request body too large' }, { status: 413 })
        const { ObjectId } = await import('mongodb')
        const body = await req.json()
        const { status, notes } = body
        const id = sanitizeString(body.id || '', 100)

        if (!id) return NextResponse.json({ error: 'Order id is required' }, { status: 400 })
        if (!status || !VALID_ORDER_STATUSES.includes(status)) {
            return NextResponse.json({ error: `Valid status required: ${VALID_ORDER_STATUSES.join(', ')}` }, { status: 400 })
        }

        let oid
        try { oid = new ObjectId(id) } catch { return NextResponse.json({ error: 'Invalid order id' }, { status: 400 }) }

        const client = await clientPromise
        const db = client.db('ECOM')
        const order = await db.collection('orders').findOne({ _id: oid })
        if (!order) return NextResponse.json({ error: 'Order not found' }, { status: 404 })

        const updateData = { status, updatedAt: new Date(), updatedBy: user.userId }
        if (notes !== undefined) updateData.adminNotes = sanitizeString(String(notes), 1000)

        await db.collection('orders').updateOne({ _id: oid }, { $set: updateData })
        const updated = await db.collection('orders').findOne({ _id: oid })

        logAudit('ORDER_STATUS_UPDATED', { userId: user.userId, userEmail: user.email, orderId: id, prevStatus: order.status, newStatus: status }, req)
        return NextResponse.json({ message: `Order status updated to "${status}"`, order: updated }, { status: 200 })

    } catch (err) {
        console.error('❌ PUT /api/orders error:', err)
        return NextResponse.json({ error: 'Failed to update order', details: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error' }, { status: 500 })
    }
}

// DELETE — cancel (user: own pending only) or hard delete (admin)
export async function DELETE(req) {
    let user = null
    try {
        await checkRateLimit(req)
        checkWriteRateLimit(req)
        user = await verifyApiToken(req)
    } catch (authErr) { return createAuthError(authErr.message, authErr.message.includes('rate') ? 429 : 401) }

    try {
        const { ObjectId } = await import('mongodb')
        const { searchParams } = new URL(req.url)
        const id = sanitizeString(searchParams.get('id') || '', 100)
        const hardDelete = searchParams.get('hard') === 'true'
        if (!id) return NextResponse.json({ error: 'Order id is required' }, { status: 400 })

        let oid
        try { oid = new ObjectId(id) } catch { return NextResponse.json({ error: 'Invalid order id' }, { status: 400 }) }

        const client = await clientPromise
        const db = client.db('ECOM')
        const order = await db.collection('orders').findOne({ _id: oid })
        if (!order) return NextResponse.json({ error: 'Order not found' }, { status: 404 })

        if (user.role !== 'admin') {
            if (order.userEmail !== user.email) return createAuthError('Access denied', 403)
            if (order.status !== 'pending') return NextResponse.json({ error: 'Only pending orders can be cancelled' }, { status: 400 })
        }

        if (hardDelete) {
            try { requireRole(user, ['admin']) } catch { return createAuthError('Only admins can permanently delete orders', 403) }
            await db.collection('orders').deleteOne({ _id: oid })
            logAudit('ORDER_HARD_DELETED', { userId: user.userId, userEmail: user.email, orderId: id }, req)
            return NextResponse.json({ message: 'Order permanently deleted' }, { status: 200 })
        }

        await db.collection('orders').updateOne({ _id: oid }, { $set: { status: 'cancelled', cancelledAt: new Date(), cancelledBy: user.userId, updatedAt: new Date() } })
        logAudit('ORDER_CANCELLED', { userId: user.userId, userEmail: user.email, orderId: id }, req)
        return NextResponse.json({ message: 'Order cancelled successfully' }, { status: 200 })

    } catch (err) {
        console.error('❌ DELETE /api/orders error:', err)
        return NextResponse.json({ error: 'Failed to cancel order', details: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error' }, { status: 500 })
    }
}
