import { NextResponse } from 'next/server'
import { verifyApiToken, ensureUserInDatabaseExport } from '@/lib/auth'

export async function GET(req) {
    try {
        // Try to get token from Authorization header
        const authHeader = req.headers.get('authorization')
        let token = null

        if (authHeader?.startsWith('Bearer ')) {
            token = authHeader.slice(7)
        }

        if (!token) {
            return NextResponse.json(
                { error: 'No token provided' },
                { status: 401 }
            )
        }

        const user = await verifyApiToken(req)

        return NextResponse.json({
            email: user.email,
            name: user.name,
            role: user.role || 'user',
            phone: user.phone || '',
            profilePicture: user.profilePicture || '',
        })
    } catch (error) {
        console.error('Error fetching user info:', error.message)
        return NextResponse.json(
            { error: error.message || 'Unauthorized' },
            { status: 401 }
        )
    }
}

// POST endpoint to ensure user exists in database (called after Google sign-in)
export async function POST(req) {
    try {
        const body = await req.json()
        const { uid, email, displayName, photoURL } = body

        if (!email) {
            return NextResponse.json(
                { error: 'Email is required' },
                { status: 400 }
            )
        }

        // Ensure user exists in database
        const firebaseUser = {
            uid,
            email,
            displayName,
            photoURL
        }

        const dbUser = await ensureUserInDatabaseExport(firebaseUser)

        if (!dbUser) {
            return NextResponse.json(
                { error: 'Failed to create/find user in database' },
                { status: 500 }
            )
        }

        return NextResponse.json({
            success: true,
            user: {
                email: dbUser.email,
                name: dbUser.name,
                role: dbUser.role || 'user',
            }
        })
    } catch (error) {
        console.error('Error ensuring user in database:', error)
        return NextResponse.json(
            { error: error.message || 'Failed to ensure user' },
            { status: 500 }
        )
    }
}
