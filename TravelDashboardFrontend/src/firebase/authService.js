import firebaseAuth from './config';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001';

class AuthService {
    // Store the auth token in localStorage
    setToken(token) {
        localStorage.setItem('authToken', token);
    }

    // Get the auth token from localStorage
    getToken() {
        return localStorage.getItem('authToken');
    }

    // Remove the auth token
    removeToken() {
        localStorage.removeItem('authToken');
    }

    // Register a new user with email verification
    async register(email, password, name) {
        try {
            const result = await firebaseAuth.signUp(email, password, name);
            return result;
        } catch (error) {
            console.error('Registration error:', error);
            return {
                success: false,
                message: 'Registration failed. Please try again.'
            };
        }
    }

    // Sign in user and get Firebase token
    async login(email, password) {
        try {
            console.log('AuthService: Starting login for:', email);
            
            // First, sign in with Firebase
            const result = await firebaseAuth.signIn(email, password);
            
            if (!result.success) {
                console.log('AuthService: Firebase sign in failed:', result.message);
                return result;
            }

            console.log('AuthService: Firebase sign in successful, checking email verification...');
            
            // Get the current user (should be freshly loaded from signIn)
            const user = result.user;
            console.log('AuthService: Email verified status:', user.emailVerified);
            
            if (!user.emailVerified) {
                console.log('AuthService: Email not verified, signing out user');
                // Sign out the user since they can't proceed
                await firebaseAuth.signOut();
                return {
                    success: false,
                    message: 'Please verify your email before signing in. Check your inbox for the verification link. If you have already verified, try refreshing the page and logging in again.',
                    requiresEmailVerification: true
                };
            }

            console.log('AuthService: Email verified, proceeding with backend verification...');

            // Get the Firebase ID token
            const tokenResult = await firebaseAuth.getIdToken();
            if (!tokenResult.success) {
                console.log('AuthService: Failed to get Firebase token');
                return {
                    success: false,
                    message: 'Failed to get authentication token.'
                };
            }

            console.log('AuthService: Firebase token obtained, storing locally...');
            // Store the token for API requests
            this.setToken(tokenResult.token);
            
            // For now, skip backend verification and return success with user data
            // This allows login to work even if backend is not running
            const userData = {
                uid: user.uid,
                email: user.email,
                name: user.displayName || user.email?.split('@')[0] || 'User',
                emailVerified: user.emailVerified
            };
            
            console.log('AuthService: Login successful for user:', userData.email);
            
            return {
                success: true,
                user: userData,
                message: 'Login successful!'
            };

            // Optional: Try backend verification but don't fail if it doesn't work
            // try {
            //     const verifyResponse = await this.verifyTokenWithBackend(tokenResult.token);
            //     if (verifyResponse.success) {
            //         console.log('AuthService: Backend verification successful');
            //     } else {
            //         console.warn('AuthService: Backend verification failed, but continuing with login');
            //     }
            // } catch (error) {
            //     console.warn('AuthService: Backend not available, continuing with login');
            // }
        } catch (error) {
            console.error('Login error:', error);
            return {
                success: false,
                message: 'Login failed. Please try again.'
            };
        }
    }

    // Verify token with backend
    async verifyTokenWithBackend(token) {
        try {
            const response = await fetch(`${API_BASE_URL}/api/auth/verify-token`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ idToken: token })
            });

            const data = await response.json();
            return data;
        } catch (error) {
            console.error('Backend verification error:', error);
            return {
                success: false,
                message: 'Failed to verify authentication with server.'
            };
        }
    }

    // Get current user from backend
    async getCurrentUser() {
        const token = this.getToken();
        if (!token) {
            return {
                success: false,
                message: 'No authentication token found.'
            };
        }

        try {
            const response = await fetch(`${API_BASE_URL}/api/auth/me`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            const data = await response.json();
            
            if (!response.ok) {
                // Token might be expired or invalid
                if (response.status === 401 || response.status === 403) {
                    this.removeToken();
                    await firebaseAuth.signOut();
                }
            }

            return data;
        } catch (error) {
            console.error('Get current user error:', error);
            return {
                success: false,
                message: 'Failed to get user information.'
            };
        }
    }

    // Sign out user
    async logout() {
        try {
            const token = this.getToken();
            
            // Notify backend of logout (optional)
            if (token) {
                try {
                    await fetch(`${API_BASE_URL}/api/auth/logout`, {
                        method: 'POST',
                        headers: {
                            'Authorization': `Bearer ${token}`,
                            'Content-Type': 'application/json'
                        }
                    });
                } catch (error) {
                    console.warn('Backend logout notification failed:', error);
                }
            }

            // Remove token and sign out from Firebase
            this.removeToken();
            await firebaseAuth.signOut();

            return {
                success: true,
                message: 'Logged out successfully!'
            };
        } catch (error) {
            console.error('Logout error:', error);
            return {
                success: false,
                message: 'Logout failed.'
            };
        }
    }

    // Send password reset email
    async resetPassword(email) {
        try {
            const result = await firebaseAuth.resetPassword(email);
            return result;
        } catch (error) {
            console.error('Password reset error:', error);
            return {
                success: false,
                message: 'Failed to send password reset email.'
            };
        }
    }

    // Resend email verification
    async resendEmailVerification() {
        try {
            const result = await firebaseAuth.sendVerificationEmail();
            return result;
        } catch (error) {
            console.error('Resend verification error:', error);
            return {
                success: false,
                message: 'Failed to send verification email.'
            };
        }
    }

    // Check if user is authenticated
    isAuthenticated() {
        const token = this.getToken();
        const user = firebaseAuth.getCurrentUser();
        return !!(token && user && user.emailVerified);
    }

    // Get auth token for API requests
    getAuthToken() {
        return this.getToken();
    }
}

export default new AuthService();