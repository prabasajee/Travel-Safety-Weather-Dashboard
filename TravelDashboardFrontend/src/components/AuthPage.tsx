import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Eye, EyeOff, Globe, Mail, Lock, User, Plane, CheckCircle, AlertCircle } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Checkbox } from './ui/checkbox';
import { Alert, AlertDescription } from './ui/alert';
import { ImageWithFallback } from './figma/ImageWithFallback';
import firebaseAuth from '../firebase/config';
import authService from '../firebase/authService';

interface AuthPageProps {
  onLogin: (userData: any) => void;
}

interface FormData {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export function AuthPage({ onLogin }: AuthPageProps) {
  const [isLogin, setIsLogin] = useState(true);
  const [registerSuccess, setRegisterSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error' | 'info'; text: string } | null>(null);
  const [waitingForVerification, setWaitingForVerification] = useState(false);

  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });

  useEffect(() => {
    // Listen for auth state changes
    const unsubscribe = firebaseAuth.onAuthStateChanged((user) => {
      if (user && user.emailVerified) {
        // User is authenticated and email is verified
        console.log('User authenticated and verified:', user.email);
        onLogin({
          name: user.displayName || user.email?.split('@')[0] || 'User',
          email: user.email || '',
          avatar: user.photoURL || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
          uid: user.uid,
          emailVerified: user.emailVerified
        });
      } else if (user && !user.emailVerified) {
        // User exists but email not verified - sign them out
        console.log('User exists but not verified, signing out:', user.email);
        firebaseAuth.signOut();
        if (!waitingForVerification) {
          setWaitingForVerification(true);
          setMessage({
            type: 'info',
            text: 'Please check your email and click the verification link to complete registration. Check your spam folder if you don\'t see the email.'
          });
        }
      } else if (!user && waitingForVerification) {
        // User signed out while waiting for verification - this is expected
        console.log('User signed out while waiting for verification');
      }
    });

    return () => unsubscribe();
  }, [onLogin, waitingForVerification]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage(null);

    // Validation
    if (!formData.email || !formData.password) {
      setMessage({ type: 'error', text: 'Please fill in all required fields.' });
      setIsLoading(false);
      return;
    }

    if (!isLogin) {
      // Registration validation
      if (!formData.name) {
        setMessage({ type: 'error', text: 'Please enter your name.' });
        setIsLoading(false);
        return;
      }
      
      if (formData.password !== formData.confirmPassword) {
        setMessage({ type: 'error', text: 'Passwords do not match.' });
        setIsLoading(false);
        return;
      }

      if (formData.password.length < 6) {
        setMessage({ type: 'error', text: 'Password must be at least 6 characters long.' });
        setIsLoading(false);
        return;
      }

      // Register user
      try {
        const result = await authService.register(formData.email, formData.password, formData.name);
        if (result.success) {
          setMessage({
            type: 'success',
            text: result.message || 'Registration successful! Please check your email for verification.'
          });
          setWaitingForVerification(true);
          // Clear the form
          setFormData({
            name: '',
            email: '',
            password: '',
            confirmPassword: ''
          });
          // Switch to login mode after showing success message
          setTimeout(() => {
            setIsLogin(true);
          }, 3000);
        } else {
          setMessage({ type: 'error', text: result.message || 'Registration failed.' });
        }
      } catch (error) {
        console.error('Registration error:', error);
        setMessage({ type: 'error', text: 'An unexpected error occurred during registration.' });
      }
    } else {
      // Login
      try {
        const result = await authService.login(formData.email, formData.password);
        if (result.success) {
          setMessage({ type: 'success', text: result.message || 'Login successful!' });
          // onLogin will be called automatically by the auth state listener
        } else {
          setMessage({ type: 'error', text: result.message || 'Login failed.' });
        }
      } catch (error) {
        setMessage({ type: 'error', text: 'An unexpected error occurred during login.' });
      }
    }

    setIsLoading(false);
  };

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleResendVerification = async () => {
    setIsLoading(true);
    try {
      const result = await firebaseAuth.sendVerificationEmail();
      if (result.success) {
        setMessage({ type: 'success', text: result.message || 'Verification email sent!' });
      } else {
        setMessage({ type: 'error', text: result.message || 'Failed to send verification email.' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Error sending verification email.' });
    }
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen flex">
      {/* Left side - Hero Image */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        <ImageWithFallback
          src="https://images.unsplash.com/photo-1488646953014-85cb44e25828?ixlib=rb-4.0.3&auto=format&fit=crop&w=1935&q=80"
          alt="Travel safety dashboard"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600/80 to-purple-600/80" />
        <div className="absolute inset-0 flex items-center justify-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center text-white px-8"
          >
            <div className="flex items-center justify-center mb-6">
              <Globe className="h-16 w-16 mr-4" />
              <Plane className="h-12 w-12" />
            </div>
            <h2 className="text-4xl mb-4">Explore the World Safely</h2>
            <p className="text-lg opacity-90">Get real-time travel safety information and weather updates for any destination worldwide.</p>
          </motion.div>
        </div>
      </div>

      {/* Right side - Auth Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-gradient-to-br from-slate-50 to-slate-100">
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
          className="w-full max-w-md"
        >
          {registerSuccess && !isLogin && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="mb-6 p-4 border border-green-300 bg-green-50 rounded-lg"
            >
              <p className="text-green-700 font-medium flex items-center">
                <CheckCircle className="h-5 w-5 mr-2" />
                Registration successful! Please check your email to verify your account.
              </p>
            </motion.div>
          )}

          <Card className="shadow-xl border-0 bg-card/50 backdrop-blur-sm">
            <CardHeader className="space-y-1 pb-4">
              <CardTitle className="text-center">
                {isLogin ? 'Sign In' : 'Create Account'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {/* Message Display */}
              {message && (
                <Alert className={`mb-4 ${message.type === 'error' ? 'border-red-500 bg-red-50' : 
                  message.type === 'success' ? 'border-green-500 bg-green-50' : 'border-blue-500 bg-blue-50'}`}>
                  {message.type === 'error' ? (
                    <AlertCircle className="h-4 w-4" />
                  ) : (
                    <CheckCircle className="h-4 w-4" />
                  )}
                  <AlertDescription className={message.type === 'error' ? 'text-red-700' : 
                    message.type === 'success' ? 'text-green-700' : 'text-blue-700'}>
                    {message.text}
                  </AlertDescription>
                </Alert>
              )}

              {/* Email Verification Waiting State */}
              {waitingForVerification && (
                <div className="mb-4 p-4 border border-yellow-500 bg-yellow-50 rounded-lg">
                  <div className="space-y-3">
                    <div>
                      <p className="text-yellow-800 font-medium">Waiting for Email Verification</p>
                      <p className="text-yellow-700 text-sm">Check your inbox and click the verification link. After clicking the link, return here and try logging in.</p>
                    </div>
                    <div className="flex space-x-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={handleResendVerification}
                        disabled={isLoading}
                        className="text-yellow-800 border-yellow-500 hover:bg-yellow-100"
                      >
                        Resend Email
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setWaitingForVerification(false);
                          setIsLogin(true);
                          setMessage(null);
                        }}
                        className="text-blue-800 border-blue-500 hover:bg-blue-100"
                      >
                        I've Verified - Try Login
                      </Button>
                    </div>
                  </div>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                {!isLogin && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    transition={{ duration: 0.3 }}
                  >
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        type="text"
                        placeholder="Full Name"
                        value={formData.name}
                        onChange={(e) => handleInputChange('name', e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </motion.div>
                )}

                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="email"
                    placeholder="Email Address"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    className="pl-10"
                  />
                </div>

                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Password"
                    value={formData.password}
                    onChange={(e) => handleInputChange('password', e.target.value)}
                    className="pl-10 pr-10"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>

                {!isLogin && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    transition={{ duration: 0.3 }}
                  >
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        type={showConfirmPassword ? 'text' : 'password'}
                        placeholder="Confirm Password"
                        value={formData.confirmPassword}
                        onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                        className="pl-10 pr-10"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      >
                        {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                    </div>
                  </motion.div>
                )}

                {isLogin && (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="remember"
                        checked={rememberMe}
                        onCheckedChange={(checked) => setRememberMe(checked as boolean)}
                      />
                      <label htmlFor="remember" className="text-sm text-muted-foreground cursor-pointer">
                        Remember me
                      </label>
                    </div>
                    <Button variant="link" className="p-0 h-auto text-sm text-blue-600 hover:text-blue-800">
                      Forgot password?
                    </Button>
                  </div>
                )}

                <Button
                  type="submit"
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-300"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      className="h-4 w-4 border-2 border-white border-t-transparent rounded-full"
                    />
                  ) : (
                    isLogin ? 'Sign In' : 'Create Account'
                  )}
                </Button>
              </form>

              <div className="mt-6 text-center">
                <p className="text-sm text-muted-foreground">
                  {isLogin ? "Don't have an account?" : "Already have an account?"}
                  <Button
                    variant="link"
                    onClick={() => setIsLogin(!isLogin)}
                    className="p-0 ml-1 text-blue-600 hover:text-blue-800"
                  >
                    {isLogin ? 'Sign up' : 'Sign in'}
                  </Button>
                </p>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}