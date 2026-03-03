// User API - Firebase Token Authentication
import { NextResponse } from 'next/server'
import { v2 as cloudinary } from 'cloudinary'
import { verifyApiToken, requireRole, createAuthError, checkRateLimit } from '@/lib/auth'
import clientPromise from '@/lib/mongodb'

// Validate environment variables
if (
    !process.env.CLOUDINARY_CLOUD_NAME ||
    !process.env.CLOUDINARY_API_KEY ||
    !process.env.CLOUDINARY_API_SECRET
) {
    throw new Error('Missing required Cloudinary environment variables')
}

// Configure Cloudinary
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
})

// Helper to log audit events to MongoDB (non-blocking)
async function logAudit(action, data, req) {
    setImmediate(async () => {
        try {
            const client = await clientPromise
            const db = client.db('ECOM')
            await db.collection('audit_logs').insertOne({
                action,
                ...data,
                timestamp: new Date(),
                ipAddress: req.headers.get('x-forwarded-for')?.split(',')[0] ||
                    req.headers.get('x-real-ip') ||
                    'unknown'
            })
        } catch (auditError) {
            console.error('Audit log error:', auditError)
        }
    })
}

// GET: return all users OR check by email if provided
export async function GET(req) {
    let user = null

    try {
        await checkRateLimit(req)
        user = await verifyApiToken(req)
    } catch (authError) {
        console.error('❌ Authentication error in GET /api/user:', authError.message)
        return createAuthError(authError.message, 401)
    }

    try {
        const { searchParams } = new URL(req.url)
        const email = searchParams.get('email')
        const getAllUsers = searchParams.get('getAllUsers')

        console.log('🔍 GET /api/user params:', { email, getAllUsers })
        console.log('🔍 Authenticated user:', { email: user.email, role: user.role })

        // Input validation
        if (email && (typeof email !== 'string' || !email.includes('@'))) {
            return NextResponse.json({ error: 'Invalid email format' }, { status: 400 })
        }

        if (email) {
            // Users can only check their own email unless admin
            if (user.email !== email && user.role !== 'admin') {
                return createAuthError('Access denied: Cannot check other users', 403)
            }

            // Get user from MongoDB
            const client = await clientPromise
            const db = client.db('ECOM')
            const foundUser = await db.collection('user').findOne({ email: email.toLowerCase() })

            logAudit('USER_EMAIL_CHECK', {
                userId: user.userId,
                userEmail: user.email,
                checkedEmail: email,
                found: !!foundUser
            }, req)

            return NextResponse.json({ exists: !!foundUser, user: foundUser })
        }

        // Get all users - ADMIN ONLY
        if (getAllUsers === 'true') {
            try {
                requireRole(user, ['admin'])
            } catch (roleError) {
                console.error('❌ Role requirement error:', roleError.message)
                return createAuthError(roleError.message, 403)
            }

            console.log('🔍 Fetching all users from MongoDB...')

            const client = await clientPromise
            const db = client.db('ECOM')
            const users = await db.collection('user').find({}).limit(1000).toArray()

            console.log('🔍 Users found:', users.length)

            logAudit('ALL_USERS_ACCESSED', {
                userId: user.userId,
                userEmail: user.email,
                userRole: user.role,
                resultCount: users.length
            }, req)

            return NextResponse.json({ users })
        }

        // Default: return current user's own profile
        const client = await clientPromise
        const db = client.db('ECOM')
        const currentUser = await db.collection('user').findOne({ email: user.email.toLowerCase() })

        if (!currentUser) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 })
        }

        return NextResponse.json({ user: currentUser })

    } catch (err) {
        console.error('❌ GET /api/user error:', err)
        console.error('❌ Stack trace:', err.stack)
        return NextResponse.json({
            error: 'Failed to fetch user data',
            details: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
        }, { status: 500 })
    }
}

// POST: insert user OR update user profile/role based on action parameter
export async function POST(req) {
    try {
        await checkRateLimit(req)

        const body = await req.json()
        const { action } = body

        console.log('🔍 POST /api/user action:', action)
        console.log('🔍 Request body:', JSON.stringify(body, null, 2))

        // Input validation
        if (!body.email || typeof body.email !== 'string' || !body.email.includes('@')) {
            return NextResponse.json({ error: 'Valid email is required' }, { status: 400 })
        }

        // Handle profile/role update
        if (action === 'update') {
            let user
            try {
                user = await verifyApiToken(req)
            } catch (authError) {
                return createAuthError(authError.message, 401)
            }

            const { email, name, phone, role } = body

            // Users can only update their own profile unless admin
            if (user.email !== email && user.role !== 'admin') {
                return createAuthError('Access denied: Cannot update other users', 403)
            }

            // Find user first to get their ID
            const client = await clientPromise
            const db = client.db('ECOM')
            const existingUser = await db.collection('user').findOne({ email: email.toLowerCase() })

            if (!existingUser) {
                return NextResponse.json({ error: 'User not found' }, { status: 404 })
            }

            // Build update data
            const updateData = {}

            if (name !== undefined) {
                if (typeof name !== 'string' || name.trim().length < 1) {
                    return NextResponse.json({ error: 'Valid name is required' }, { status: 400 })
                }
                updateData.name = name.trim()
            }

            if (phone !== undefined) {
                if (typeof phone !== 'string') {
                    return NextResponse.json({ error: 'Valid phone is required' }, { status: 400 })
                }
                updateData.phone = phone.trim()
            }

            // Role updates - admin only
            if (role !== undefined) {
                try {
                    requireRole(user, ['admin'])
                } catch (roleError) {
                    return createAuthError('Only admins can update user roles', 403)
                }

                if (['admin', 'user', 'shop_owner'].includes(role)) {
                    updateData.role = role
                    console.log('✅ Setting role to:', role)
                } else {
                    return NextResponse.json({ error: 'Invalid role' }, { status: 400 })
                }
            }

            console.log('🔄 Updating user with data:', updateData)

            const result = await db.collection('user').updateOne(
                { _id: existingUser._id },
                { $set: { ...updateData, updatedAt: new Date() } }
            )

            const updatedUser = await db.collection('user').findOne({ _id: existingUser._id })

            console.log('✅ Updated user role:', updatedUser.role)

            logAudit('USER_PROFILE_UPDATED', {
                userId: user.userId,
                userEmail: user.email,
                targetEmail: email,
                updatedFields: Object.keys(updateData)
            }, req)

            return NextResponse.json({
                message: 'Profile updated successfully',
                user: updatedUser,
            }, { status: 200 })
        }

        // Handle user creation - ALLOW SELF-REGISTRATION OR ADMIN CREATION
        let user = null
        let isAdminCreation = false
        let requiresAuth = false

        try {
            user = await verifyApiToken(req)
            isAdminCreation = user.email !== body.email.toLowerCase()
            requiresAuth = true
        } catch (authError) {
            isAdminCreation = false
            requiresAuth = false
        }

        // Only require admin role if creating for someone else
        if (isAdminCreation && requiresAuth) {
            try {
                requireRole(user, ['admin'])
            } catch (roleError) {
                return createAuthError('Only admins can create accounts for other users', 403)
            }
        }

        // Check if user exists
        const client = await clientPromise
        const db = client.db('ECOM')
        const existingUser = await db.collection('user').findOne({ email: body.email.toLowerCase() })

        if (existingUser) {
            return NextResponse.json({ message: 'User already exists', user: existingUser }, { status: 200 })
        }

        // Validate required fields for new user
        if (!body.name || typeof body.name !== 'string' || body.name.trim().length < 1) {
            return NextResponse.json({ error: 'Valid name is required' }, { status: 400 })
        }

        // Create new user
        const newUserData = {
            email: body.email.toLowerCase().trim(),
            name: body.name.trim(),
            phone: body.phone || '',
            role: isAdminCreation && body.role && ['admin', 'user', 'shop_owner'].includes(body.role)
                ? body.role
                : 'user',
            profilePicture: body.profilePicture || '',
            firebaseUid: body.firebaseUid || '',
            createdAt: new Date(),
            updatedAt: new Date(),
        }

        const result = await db.collection('user').insertOne(newUserData)
        const createdUser = await db.collection('user').findOne({ _id: result.insertedId })

        logAudit(user ? 'USER_CREATED' : 'SELF_REGISTRATION', {
            userId: user?.userId,
            userEmail: user?.email,
            targetEmail: body.email,
            assignedRole: newUserData.role
        }, req)

        return NextResponse.json({ message: 'User created', user: createdUser }, { status: 201 })

    } catch (err) {
        console.error('❌ POST /api/user error:', err)
        console.error('❌ Stack trace:', err.stack)
        return NextResponse.json({
            error: 'Failed to process user data',
            details: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
        }, { status: 500 })
    }
}

// PUT: update user profile picture with Cloudinary upload
export async function PUT(req) {
    let user = null

    try {
        await checkRateLimit(req)
        user = await verifyApiToken(req)
    } catch (authError) {
        console.error('❌ Authentication error in PUT /api/user:', authError.message)
        return createAuthError(authError.message, 401)
    }

    try {
        const formData = await req.formData()
        const email = formData.get('email')
        const file = formData.get('file')

        // Input validation
        if (!email || typeof email !== 'string' || !email.includes('@')) {
            return NextResponse.json({ error: 'Valid email is required' }, { status: 400 })
        }

        if (!file) {
            return NextResponse.json({ error: 'File is required' }, { status: 400 })
        }

        // Users can only update their own profile picture unless admin
        if (user.email !== email && user.role !== 'admin') {
            return createAuthError('Access denied: Cannot update other users\' profile pictures', 403)
        }

        // Validate file type
        if (!file.type.startsWith('image/')) {
            return NextResponse.json({ error: 'Only image files are allowed' }, { status: 400 })
        }

        // Validate file size (5MB limit)
        const maxSize = 5 * 1024 * 1024 // 5MB
        if (file.size > maxSize) {
            return NextResponse.json({ error: 'File size must be less than 5MB' }, { status: 400 })
        }

        // Convert file to buffer for Cloudinary upload
        const bytes = await file.arrayBuffer()
        const buffer = Buffer.from(bytes)

        // Upload to Cloudinary
        const uploadResponse = await new Promise((resolve, reject) => {
            cloudinary.uploader
                .upload_stream(
                    {
                        resource_type: 'image',
                        folder: 'nishat_profile_pictures',
                        public_id: `user_${email
                            .replace('@', '_')
                            .replace(/\./g, '_')}_${Date.now()}`,
                        transformation: [
                            { width: 400, height: 400, crop: 'fill' },
                            { quality: 'auto' },
                            { format: 'auto' },
                        ],
                    },
                    (error, result) => {
                        if (error) {
                            console.error('Cloudinary upload error:', error)
                            reject(new Error(`Cloudinary upload failed: ${error.message}`))
                        } else {
                            resolve(result)
                        }
                    }
                )
                .end(buffer)
        })

        // Find user
        const client = await clientPromise
        const db = client.db('ECOM')
        const existingUser = await db.collection('user').findOne({ email: email.toLowerCase() })

        if (!existingUser) {
            // If upload succeeded but user not found, clean up the uploaded image
            try {
                await cloudinary.uploader.destroy(uploadResponse.public_id)
            } catch (cleanupError) {
                console.error('Error cleaning up uploaded image:', cleanupError)
            }
            return NextResponse.json({ error: 'User not found' }, { status: 404 })
        }

        // Delete old profile picture from Cloudinary if exists
        if (existingUser.profilePicturePublicId) {
            try {
                await cloudinary.uploader.destroy(existingUser.profilePicturePublicId)
            } catch (deleteError) {
                console.error('Error deleting old image:', deleteError)
            }
        }

        // Update user with new profile picture URL
        await db.collection('user').updateOne(
            { _id: existingUser._id },
            {
                $set: {
                    profilePicture: uploadResponse.secure_url,
                    profilePicturePublicId: uploadResponse.public_id,
                    updatedAt: new Date()
                }
            }
        )

        const updatedUser = await db.collection('user').findOne({ _id: existingUser._id })

        logAudit('PROFILE_PICTURE_UPDATED', {
            userId: user.userId,
            userEmail: user.email,
            targetEmail: email,
            cloudinaryPublicId: uploadResponse.public_id
        }, req)

        return NextResponse.json({
            message: 'Profile picture updated successfully',
            imageUrl: uploadResponse.secure_url,
            publicId: uploadResponse.public_id,
            user: updatedUser
        }, { status: 200 })

    } catch (err) {
        console.error('❌ Error updating profile picture:', err)
        console.error('❌ Stack trace:', err.stack)
        return NextResponse.json({
            error: 'Failed to update profile picture',
            details: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
        }, { status: 500 })
    }
}

// DELETE: remove user profile picture from Cloudinary and database
export async function DELETE(req) {
    let user = null

    try {
        await checkRateLimit(req)
        user = await verifyApiToken(req)
    } catch (authError) {
        console.error('❌ Authentication error in DELETE /api/user:', authError.message)
        return createAuthError(authError.message, 401)
    }

    try {
        const { searchParams } = new URL(req.url)
        const email = searchParams.get('email')

        // Input validation
        if (!email || typeof email !== 'string' || !email.includes('@')) {
            return NextResponse.json({ error: 'Valid email is required' }, { status: 400 })
        }

        // Users can only delete their own profile picture unless admin
        if (user.email !== email && user.role !== 'admin') {
            return createAuthError('Access denied: Cannot delete other users\' profile pictures', 403)
        }

        // Find user
        const client = await clientPromise
        const db = client.db('ECOM')
        const foundUser = await db.collection('user').findOne({ email: email.toLowerCase() })

        if (!foundUser) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 })
        }

        if (!foundUser.profilePicturePublicId) {
            return NextResponse.json({ message: 'No profile picture to delete' }, { status: 200 })
        }

        // Delete from Cloudinary
        try {
            await cloudinary.uploader.destroy(foundUser.profilePicturePublicId)
        } catch (deleteError) {
            console.error('Error deleting from Cloudinary:', deleteError)
        }

        // Update user - remove profile picture fields
        await db.collection('user').updateOne(
            { _id: foundUser._id },
            {
                $unset: {
                    profilePicture: '',
                    profilePicturePublicId: ''
                },
                $set: { updatedAt: new Date() }
            }
        )

        logAudit('PROFILE_PICTURE_DELETED', {
            userId: user.userId,
            userEmail: user.email,
            targetEmail: email,
            deletedPublicId: foundUser.profilePicturePublicId
        }, req)

        return NextResponse.json({ message: 'Profile picture deleted successfully' }, { status: 200 })

    } catch (err) {
        console.error('❌ Error deleting profile picture:', err)
        console.error('❌ Stack trace:', err.stack)
        return NextResponse.json({
            error: 'Failed to delete profile picture',
            details: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
        }, { status: 500 })
    }
}

