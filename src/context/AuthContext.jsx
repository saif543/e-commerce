'use client'

import { createContext, useContext, useState, useEffect } from 'react'
import {
    createUserWithEmailAndPassword,
    getAuth,
    OAuthProvider,
    onAuthStateChanged,
    signInWithEmailAndPassword,
    signInWithPopup,
    signOut as firebaseSignOut,
    updateProfile,
    sendPasswordResetEmail,
    sendEmailVerification,
} from 'firebase/auth'
import app, { googleProvider } from '../../Firebase/firebase.config'

export const AuthContext = createContext(null)
const auth = getAuth(app)

// Apple Provider
const appleProvider = new OAuthProvider('apple.com')

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null)
    const [loading, setLoading] = useState(true)
    const [userRole, setUserRole] = useState(null)

    // Google Sign-in
    const handleGoogleSignIn = async () => {
        setLoading(true)
        try {
            const result = await signInWithPopup(auth, googleProvider)
            const user = result.user
            
            // Ensure user exists in database
            try {
                const token = await user.getIdToken()
                await fetch('/api/auth/me', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        uid: user.uid,
                        email: user.email,
                        displayName: user.displayName,
                        photoURL: user.photoURL,
                    }),
                })
            } catch (dbError) {
                console.error('Error ensuring user in database:', dbError)
                // Continue anyway - user will be created on next API call
            }
            
            return { success: true, user: result.user }
        } catch (error) {
            return { success: false, error: error.message }
        } finally {
            setLoading(false)
        }
    }

    // Apple Sign-in
    const handleAppleSignIn = async () => {
        setLoading(true)
        try {
            const result = await signInWithPopup(auth, appleProvider)
            return { success: true, user: result.user }
        } catch (error) {
            return { success: false, error: error.message }
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
            setUser(currentUser)
            
            // Fetch user role from database if user exists
            if (currentUser) {
                try {
                    const token = await currentUser.getIdToken()
                    const res = await fetch('/api/auth/me', {
                        headers: {
                            'Authorization': `Bearer ${token}`
                        }
                    })
                    if (res.ok) {
                        const data = await res.json()
                        setUserRole(data.role || 'user')
                    }
                } catch (error) {
                    console.error('Error fetching user role:', error)
                    setUserRole('user')
                }
            } else {
                setUserRole(null)
            }
            
            setLoading(false)
        })

        return () => unsubscribe()
    }, [])

    const createUser = async (email, password) => {
        setLoading(true)
        try {
            const result = await createUserWithEmailAndPassword(auth, email, password)
            return { success: true, user: result.user }
        } catch (error) {
            return { success: false, error: error.message }
        } finally {
            setLoading(false)
        }
    }

    const signIn = async (email, password) => {
        setLoading(true)
        try {
            const result = await signInWithEmailAndPassword(auth, email, password)
            return { success: true, user: result.user }
        } catch (error) {
            return { success: false, error: error.message }
        } finally {
            setLoading(false)
        }
    }

    const logOut = async () => {
        setLoading(true)
        try {
            await firebaseSignOut(auth)
            setUserRole(null)
            return { success: true }
        } catch (error) {
            return { success: false, error: error.message }
        } finally {
            setLoading(false)
        }
    }

    const signOut = logOut

    const updateUser = async (currentUser, name, photo) => {
        try {
            await updateProfile(currentUser, {
                displayName: name,
                photoURL: photo,
            })
            return { success: true }
        } catch (error) {
            return { success: false, error: error.message }
        }
    }

    const passwordReset = async (email) => {
        setLoading(true)
        try {
            await sendPasswordResetEmail(auth, email)
            return { success: true }
        } catch (error) {
            return { success: false, error: error.message }
        } finally {
            setLoading(false)
        }
    }

    const verifyEmail = async () => {
        setLoading(true)
        try {
            await sendEmailVerification(auth.currentUser)
            return { success: true }
        } catch (error) {
            return { success: false, error: error.message }
        } finally {
            setLoading(false)
        }
    }

    const getToken = async () => {
        if (!auth.currentUser) return null
        return await auth.currentUser.getIdToken()
    }

    const authInfo = {
        user,
        userRole,
        loading,
        createUser,
        signIn,
        logOut,
        signOut,
        handleGoogleSignIn,
        handleAppleSignIn,
        updateUser,
        verifyEmail,
        passwordReset,
        getToken,
    }

    return (
        <AuthContext.Provider value={authInfo}>
            {children}
        </AuthContext.Provider>
    )
}

export function useAuth() {
    const context = useContext(AuthContext)
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider')
    }
    return context
}
