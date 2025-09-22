// Import the functions you need from the SDKs you need
import { initializeApp } from 'firebase/app';
import { 
    getAuth, 
    signInWithEmailAndPassword, 
    createUserWithEmailAndPassword, 
    signOut, 
    onAuthStateChanged,
    GoogleAuthProvider,
    signInWithPopup,
    sendPasswordResetEmail,
    updateProfile,
    sendEmailVerification
} from 'firebase/auth';

// Your Firebase configuration - Using environment variables for security
const firebaseConfig = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: import.meta.env.VITE_FIREBASE_APP_ID,
    measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication and get a reference to the service
const auth = getAuth(app);

// Google Auth Provider
const googleProvider = new GoogleAuthProvider();

// Authentication functions
export const firebaseAuth = {
    // Sign up with email and password
    signUp: async (email, password, displayName) => {
        try {
            console.log('Creating user with email:', email);
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            console.log('User created successfully:', userCredential.user.uid);
            
            // Update user profile with display name
            if (displayName) {
                await updateProfile(userCredential.user, {
                    displayName: displayName
                });
                console.log('Profile updated with display name:', displayName);
            }
            
            // Send email verification with custom settings
            const actionCodeSettings = {
                // URL the user will be redirected to after clicking the email verification link
                // For production, this should be your GitHub Pages URL
                url: window.location.origin + (import.meta.env.PROD ? '/Travel-Safety-Weather-Dashboard/' : '/login'),
                // This must be true for email verification
                handleCodeInApp: false,
            };

            console.log('Sending email verification to:', userCredential.user.email);
            await sendEmailVerification(userCredential.user, actionCodeSettings);
            console.log('Verification email sent successfully');
            
            // Sign out the user immediately after registration to force email verification
            await signOut(auth);
            console.log('User signed out to enforce email verification');
            
            return {
                success: true,
                user: userCredential.user,
                message: 'Account created successfully! A verification email has been sent to ' + email + '. Please check your email (including spam folder) and click the verification link before signing in.',
                requiresEmailVerification: true
            };
        } catch (error) {
            console.error('Registration error:', error);
            return {
                success: false,
                error: error.code,
                message: getErrorMessage(error.code)
            };
        }
    },

    // Sign in with email and password
    signIn: async (email, password) => {
        try {
            console.log('Attempting to sign in with email:', email);
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            
            // Reload the user to get the latest emailVerified status
            console.log('User signed in, reloading to check email verification status...');
            await userCredential.user.reload();
            
            console.log('Email verified status:', userCredential.user.emailVerified);
            
            return {
                success: true,
                user: userCredential.user,
                message: 'Signed in successfully!'
            };
        } catch (error) {
            console.error('Sign in error:', error);
            return {
                success: false,
                error: error.code,
                message: getErrorMessage(error.code)
            };
        }
    },

    // Sign in with Google
    signInWithGoogle: async () => {
        try {
            const result = await signInWithPopup(auth, googleProvider);
            return {
                success: true,
                user: result.user,
                message: 'Signed in with Google successfully!'
            };
        } catch (error) {
            return {
                success: false,
                error: error.code,
                message: getErrorMessage(error.code)
            };
        }
    },

    // Sign out
    signOut: async () => {
        try {
            await signOut(auth);
            return {
                success: true,
                message: 'Signed out successfully!'
            };
        } catch (error) {
            return {
                success: false,
                error: error.code,
                message: 'Error signing out'
            };
        }
    },

    // Reset password
    resetPassword: async (email) => {
        try {
            await sendPasswordResetEmail(auth, email);
            return {
                success: true,
                message: 'Password reset email sent!'
            };
        } catch (error) {
            return {
                success: false,
                error: error.code,
                message: getErrorMessage(error.code)
            };
        }
    },

    // Send email verification
    sendVerificationEmail: async () => {
        try {
            const user = auth.currentUser;
            if (user) {
                const actionCodeSettings = {
                    url: window.location.origin + (import.meta.env.PROD ? '/Travel-Safety-Weather-Dashboard/' : '/login'),
                    handleCodeInApp: false,
                };
                
                console.log('Resending verification email to:', user.email);
                await sendEmailVerification(user, actionCodeSettings);
                console.log('Verification email resent successfully');
                
                return {
                    success: true,
                    message: 'Verification email sent! Please check your inbox and spam folder.'
                };
            } else {
                return {
                    success: false,
                    message: 'No user logged in'
                };
            }
        } catch (error) {
            console.error('Resend verification error:', error);
            return {
                success: false,
                error: error.code,
                message: getErrorMessage(error.code)
            };
        }
    },

    // Check if email is verified
    isEmailVerified: () => {
        const user = auth.currentUser;
        return user ? user.emailVerified : false;
    },

    // Get current user
    getCurrentUser: () => {
        return auth.currentUser;
    },

    // Reload current user to get latest verification status
    reloadCurrentUser: async () => {
        const user = auth.currentUser;
        if (user) {
            await user.reload();
            return auth.currentUser;
        }
        return null;
    },

    // Get ID token
    getIdToken: async () => {
        const user = auth.currentUser;
        if (user) {
            try {
                const token = await user.getIdToken();
                return { success: true, token };
            } catch (error) {
                return { success: false, error: error.message };
            }
        }
        return { success: false, error: 'No user signed in' };
    },

    // Auth state observer
    onAuthStateChanged: (callback) => {
        return onAuthStateChanged(auth, callback);
    }
};

// Helper function to convert Firebase error codes to user-friendly messages
const getErrorMessage = (errorCode) => {
    switch (errorCode) {
        case 'auth/user-not-found':
            return 'No user found with this email address.';
        case 'auth/wrong-password':
            return 'Incorrect password.';
        case 'auth/email-already-in-use':
            return 'An account with this email already exists.';
        case 'auth/weak-password':
            return 'Password should be at least 6 characters.';
        case 'auth/invalid-email':
            return 'Invalid email address.';
        case 'auth/too-many-requests':
            return 'Too many failed attempts. Please try again later.';
        case 'auth/network-request-failed':
            return 'Network error. Please check your connection.';
        case 'auth/popup-closed-by-user':
            return 'Sign-in popup was closed before completion.';
        default:
            return 'An error occurred during authentication.';
    }
};

export { auth };
export default firebaseAuth;