import jwt from 'jsonwebtoken'
import { NextResponse } from 'next/server'
import admin from 'firebase-admin'
import clientPromise from './mongodb'
import crypto from 'crypto'

// Initialize Firebase Admin SDK (only initialize once).
if (!admin.apps.length) {
    try {
        const serviceAccount = {
            projectId: process.env.FIREBASE_PROJECT_ID,
            clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
            privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
        }

        // ✅ Validate Firebase credentials
        if (!serviceAccount.projectId || !serviceAccount.clientEmail || !serviceAccount.privateKey) {
            throw new Error('Missing Firebase credentials')
        }

        admin.initializeApp({
            credential: admin.credential.cert(serviceAccount),
            projectId: process.env.FIREBASE_PROJECT_ID,
        })
        console.log('✅ Firebase Admin SDK initialized')
    } catch (error) {
        console.error('🚨 CRITICAL - Firebase Admin initialization failed:', error.message)
    }
}

// ✅ Email validation helper
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return typeof email === 'string' && emailRegex.test(email)
}

// Get user data from database by email
async function getUserFromDatabase(email) {
    try {
        if (!isValidEmail(email)) {
            console.warn('Invalid email format provided to database lookup:', email)
            return null
        }

        const client = await clientPromise
        const db = client.db('BUYKORBO')
        const user = await db.collection('user').findOne({ email: email.toLowerCase() })
        return user
    } catch (error) {
        console.error('Database lookup error:', error.message)
        return null
    }
}

// Helper function to ensure user exists in database (for first-time Firebase users)
async function ensureUserInDatabase(firebaseUser) {
    try {
        if (!firebaseUser?.email) {
            throw new Error('Invalid Firebase user - missing email')
        }

        if (!isValidEmail(firebaseUser.email)) {
            throw new Error('Invalid email format from Firebase')
        }

        const client = await clientPromise
        const db = client.db('BUYKORBO')

        const existingUser = await db.collection('user').findOne({
            email: firebaseUser.email.toLowerCase()
        })

        if (!existingUser) {
            // Create new user with default role
            const newUser = {
                email: firebaseUser.email.toLowerCase(),
                name: firebaseUser.displayName || firebaseUser.email,
                phone: firebaseUser.phoneNumber || '',
                role: 'user',
                branch: 'main',
                isStockEditor: false,
                profilePicture: firebaseUser.photoURL || '',
                createdAt: new Date(),
                updatedAt: new Date(),
                firebaseUid: firebaseUser.uid
            }

            const result = await db.collection('user').insertOne(newUser)
            console.log(`✅ New user created in MongoDB: ${firebaseUser.email}`)
            return { ...newUser, _id: result.insertedId }
        }

        return existingUser
    } catch (error) {
        console.error('Error ensuring user in database:', error.message)
        return null
    }
}

// Verify JWT token from request (now supports both Firebase and custom JWT with database role lookup)
export async function verifyApiToken(req) {
    const requestId = crypto.randomUUID()

    // Get token from Authorization header or cookies
    const authHeader = req.headers.get('authorization')
    let token = null

    if (authHeader?.startsWith('Bearer ')) {
        token = authHeader.slice(7)
    } else if (req.cookies?.get('auth-token')) {
        token = req.cookies.get('auth-token').value
    }

    if (!token) {
        console.warn(`[${requestId}] ⚠️ No token provided`)
        throw new Error('Authentication required - no token provided')
    }

    try {
        // First, try to verify as Firebase ID token
        const decodedToken = await admin.auth().verifyIdToken(token)

        // ✅ Validate email format
        if (!isValidEmail(decodedToken.email)) {
            console.error(`[${requestId}] ❌ Invalid email format in Firebase token`)
            throw new Error('Authentication failed')
        }

        console.log(`[${requestId}] ✅ Firebase token verified for: ${decodedToken.email}`)

        // ✅ FIX: Ensure user exists in MongoDB (creates if not exists)
        let dbUser = await getUserFromDatabase(decodedToken.email)

        if (!dbUser) {
            console.log(`[${requestId}] ⚠️ User not in MongoDB, creating...`)
            dbUser = await ensureUserInDatabase(decodedToken)
        }

        if (!dbUser) {
            console.error(`[${requestId}] ❌ Failed to create/find user in MongoDB`)
            throw new Error('Database error - user creation failed')
        }

        console.log(`[${requestId}] ✅ Firebase auth successful: ${decodedToken.email}`)

        // Return combined Firebase + Database user info
        return {
            userId: decodedToken.uid,
            email: decodedToken.email,
            name: dbUser.name || decodedToken.name || decodedToken.email,
            role: dbUser.role || 'user',
            branch: dbUser.branch || 'main',
            isStockEditor: dbUser.isStockEditor || false,
            phone: dbUser.phone || '',
            profilePicture: dbUser.profilePicture || decodedToken.picture || '',
            dbUserId: dbUser._id.toString(),
            provider: 'firebase',
            firebase_claims: decodedToken,
            requestId
        }
    } catch (firebaseError) {
        // If Firebase verification fails, try custom JWT
        try {
            if (!process.env.JWT_SECRET) {
                console.error(`[${requestId}] ❌ JWT_SECRET not configured`)
                throw new Error('Authentication failed')
            }

            const decoded = jwt.verify(token, process.env.JWT_SECRET)

            if (!decoded.email || !isValidEmail(decoded.email)) {
                console.error(`[${requestId}] ❌ Invalid email in JWT token`)
                throw new Error('Authentication failed')
            }

            // If it's a JWT token, also lookup database user for role
            if (decoded.email) {
                const dbUser = await getUserFromDatabase(decoded.email)
                if (dbUser) {
                    console.log(`[${requestId}] ✅ JWT auth successful: ${decoded.email}`)
                    return {
                        ...decoded,
                        role: dbUser.role || decoded.role || 'user',
                        branch: dbUser.branch || decoded.branch || 'main',
                        isStockEditor: dbUser.isStockEditor || false,
                        name: dbUser.name || decoded.name,
                        phone: dbUser.phone || decoded.phone || '',
                        profilePicture: dbUser.profilePicture || '',
                        dbUserId: dbUser._id.toString(),
                        provider: 'jwt',
                        requestId
                    }
                }
            }

            console.log(`[${requestId}] ✅ JWT auth successful (no DB user)`)
            return {
                ...decoded,
                provider: 'jwt',
                requestId
            }
        } catch (jwtError) {
            console.error(`[${requestId}] ❌ Firebase token verification failed:`, firebaseError.message)
            console.error(`[${requestId}] ❌ JWT token verification failed:`, jwtError.message)

            if (firebaseError.code === 'auth/id-token-expired' || jwtError.name === 'TokenExpiredError') {
                throw new Error('Token expired')
            }
            if (firebaseError.code === 'auth/argument-error' || jwtError.name === 'JsonWebTokenError') {
                throw new Error('Invalid token')
            }
            throw new Error('Authentication failed')
        }
    }
}

// Check if user has required role
export function requireRole(user, allowedRoles = ['admin']) {
    if (!user?.role || !allowedRoles.includes(user.role)) {
        console.warn(`[${user?.requestId}] ⚠️ Access denied - user role: ${user?.role}, required: ${allowedRoles.join(' or ')}`)
        throw new Error(`Access denied. Required role: ${allowedRoles.join(' or ')}`)
    }
    return true
}

// Create standardized auth error response
export function createAuthError(message, status = 401) {
    return NextResponse.json(
        {
            error: message,
            timestamp: new Date().toISOString(),
        },
        {
            status,
            headers: { 'Content-Type': 'application/json' }
        }
    )
}

// Simple rate limiting (in-memory - upgrade to Redis for production)
const requestCounts = new Map()
const RATE_LIMIT = 100 // requests per window
const WINDOW_MS = 15 * 60 * 1000 // 15 minutes

export function checkRateLimit(req) {
    const ip = req.headers.get('x-forwarded-for')?.split(',')[0] ||
        req.headers.get('x-real-ip') ||
        'unknown'

    const now = Date.now()
    const windowStart = now - WINDOW_MS

    // Clean old entries
    requestCounts.forEach((data, key) => {
        if (data.timestamp < windowStart) {
            requestCounts.delete(key)
        }
    })

    const current = requestCounts.get(ip) || { count: 0, timestamp: now }

    if (current.timestamp < windowStart) {
        current.count = 1
        current.timestamp = now
    } else {
        current.count++
    }

    requestCounts.set(ip, current)

    if (current.count > RATE_LIMIT) {
        throw new Error('Too many requests - rate limit exceeded')
    }
}

// Helper function to update user role in database
export async function updateUserRole(email, role, branch = null) {
    try {
        if (!isValidEmail(email)) {
            throw new Error('Invalid email format')
        }

        const client = await clientPromise
        const db = client.db('BUYKORBO')

        const updateData = {
            role,
            updatedAt: new Date()
        }

        if (branch !== null) {
            updateData.branch = branch
        }

        const result = await db.collection('user').updateOne(
            { email: email.toLowerCase() },
            { $set: updateData }
        )

        return result.matchedCount > 0
    } catch (error) {
        console.error('Error updating user role:', error.message)
        return false
    }
}

// Export function for external use
export async function ensureUserInDatabaseExport(firebaseUser) {
    return ensureUserInDatabase(firebaseUser)
}
