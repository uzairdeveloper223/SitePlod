'use client'

import { useEffect, useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { PageWrapper } from '@/components/siteplod/page-wrapper'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { LogIn, UserPlus, Loader2, Check, AlertCircle, Mail } from 'lucide-react'
import { toast } from 'sonner'
import { apiClient } from '@/lib/api-client'
import { validateEmail, validatePassword, type PasswordValidation } from '@/lib/validation'
import { cn } from '@/lib/utils'

export default function LoginPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login')
  const [isAuthLoading, setIsAuthLoading] = useState(false)
  
  // Form state
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [emailError, setEmailError] = useState<string | null>(null)
  const [password, setPassword] = useState('')
  const [passwordValidation, setPasswordValidation] = useState<PasswordValidation | null>(null)
  
  // Verification state
  const [showResendButton, setShowResendButton] = useState(false)
  const [isResending, setIsResending] = useState(false)

  useEffect(() => {
    // Check for verification success
    if (searchParams.get('verified') === 'true') {
      toast.success('Email verified!', {
        description: 'Your email has been verified. You can now log in.',
        duration: 5000
      })
    }
    
    // Check for verification errors
    const error = searchParams.get('error')
    if (error) {
      const errorMessages: Record<string, string> = {
        'invalid_verification_link': 'Invalid verification link. Please try again or request a new one.',
        'verification_failed': 'Email verification failed. Please try again.',
        'email_not_verified': 'Please verify your email before logging in.'
      }
      
      toast.error('Verification Error', {
        description: errorMessages[error] || 'An error occurred during verification.',
        duration: 5000
      })
    }
    
    // Check if user just registered
    if (searchParams.get('registered') === 'true') {
      toast.info('Check your email', {
        description: 'We sent you a verification link. Please check your inbox.',
        duration: 6000
      })
    }
  }, [searchParams])

  const handleEmailChange = (value: string) => {
    setEmail(value)
    const validation = validateEmail(value)
    setEmailError(validation.valid ? null : validation.error || null)
  }
  
  const handlePasswordChange = (value: string) => {
    setPassword(value)
    const validation = validatePassword(value)
    setPasswordValidation(validation)
  }

  const handleResendVerification = async () => {
    if (!email) {
      toast.error('Email required', {
        description: 'Please enter your email address'
      })
      return
    }
    
    setIsResending(true)
    try {
      await apiClient.resendVerification(email)
      toast.success('Email sent!', {
        description: 'Check your inbox for the verification link.',
        duration: 5000
      })
    } catch (error) {
      toast.error('Failed to resend', {
        description: 'Please try again later.'
      })
    } finally {
      setIsResending(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (isAuthLoading) return
    
    setIsAuthLoading(true)
    setShowResendButton(false)
    
    try {
      if (authMode === 'login') {
        // Login
        const response = await apiClient.login({
          email,
          password
        })
        
        toast.success('Welcome back!', {
          description: 'You have successfully logged in'
        })
        
        // Redirect to dashboard
        router.push('/')
      } else {
        // Register
        if (!username) {
          toast.error('Username required', {
            description: 'Please enter a username'
          })
          return
        }
        
        const response = await apiClient.register({
          username,
          email,
          password
        })
        
        // Check if email verification is required
        if (response.requiresVerification) {
          toast.success('Check your email!', {
            description: 'We sent you a verification link. Please check your inbox.',
            duration: 6000
          })
          
          // Switch to login mode
          setAuthMode('login')
          setPassword('')
        } else {
          // Auto-login if no verification required
          toast.success('Account created!', {
            description: 'Welcome to SitePlod'
          })
          
          // Redirect to dashboard
          router.push('/')
        }
      }
    } catch (error: any) {
      console.error('Auth error:', error)
      
      // Handle email verification required error
      if (error.data?.requiresVerification) {
        setShowResendButton(true)
        toast.error('Email not verified', {
          description: 'Please check your email and click the verification link.',
          duration: 6000
        })
      } else {
        toast.error(authMode === 'login' ? 'Login failed' : 'Registration failed', {
          description: error.message || 'Please check your credentials and try again'
        })
      }
    } finally {
      setIsAuthLoading(false)
    }
  }

  return (
    <PageWrapper>
      <div className="min-h-screen flex items-center justify-center px-4 py-12">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-2xl text-center">
              {authMode === 'login' ? 'Welcome Back' : 'Create Account'}
            </CardTitle>
            <CardDescription className="text-center">
              {authMode === 'login'
                ? 'Sign in to manage your deployed sites.'
                : 'Register to save and manage your sites with a personalized dashboard.'}
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            {showResendButton && (
              <Alert className="mb-6">
                <Mail className="h-4 w-4" />
                <AlertDescription className="flex items-center justify-between">
                  <span>Need a new verification email?</span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleResendVerification}
                    disabled={isResending}
                  >
                    {isResending ? (
                      <><Loader2 className="w-3 h-3 mr-1 animate-spin" /> Sending...</>
                    ) : (
                      'Resend'
                    )}
                  </Button>
                </AlertDescription>
              </Alert>
            )}
            
            <form onSubmit={handleSubmit} className="space-y-6">
              {authMode === 'register' && (
                <div className="space-y-2">
                  <Label htmlFor="username">Username</Label>
                  <Input 
                    id="username" 
                    placeholder="johndoe" 
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required 
                    disabled={isAuthLoading} 
                  />
                </div>
              )}
              
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input 
                  id="email" 
                  type="email" 
                  placeholder="you@example.com" 
                  value={email}
                  onChange={(e) => handleEmailChange(e.target.value)}
                  required 
                  disabled={isAuthLoading}
                  className={emailError ? 'border-red-500' : !emailError && email ? 'border-green-500' : ''}
                />
                {emailError && (
                  <p className="text-sm text-red-400">{emailError}</p>
                )}
                {!emailError && email && (
                  <p className="text-sm text-green-400 flex items-center gap-1">
                    <Check className="w-4 h-4" /> Valid email
                  </p>
                )}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input 
                  id="password" 
                  type="password" 
                  placeholder="••••••••" 
                  value={password}
                  onChange={(e) => handlePasswordChange(e.target.value)}
                  required 
                  disabled={isAuthLoading}
                  className={passwordValidation?.error ? 'border-red-500' : !passwordValidation?.error && password ? 'border-green-500' : ''}
                />
                {passwordValidation?.error && authMode === 'register' && (
                  <p className="text-sm text-red-400">{passwordValidation.error}</p>
                )}
                {password && passwordValidation && authMode === 'register' && (
                  <div className="space-y-2">
                    {/* Strength indicator */}
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-2 bg-obsidian border border-gold/30 overflow-hidden">
                        <div 
                          className={cn(
                            'h-full transition-all duration-300',
                            passwordValidation.strength === 'weak' && 'w-1/4 bg-red-500',
                            passwordValidation.strength === 'fair' && 'w-2/4 bg-yellow-500',
                            passwordValidation.strength === 'good' && 'w-3/4 bg-blue-500',
                            passwordValidation.strength === 'strong' && 'w-full bg-green-500'
                          )}
                        />
                      </div>
                      <span className={cn(
                        'text-xs uppercase tracking-wide',
                        passwordValidation.strength === 'weak' && 'text-red-400',
                        passwordValidation.strength === 'fair' && 'text-yellow-400',
                        passwordValidation.strength === 'good' && 'text-blue-400',
                        passwordValidation.strength === 'strong' && 'text-green-400'
                      )}>
                        {passwordValidation.strength}
                      </span>
                    </div>
                    
                    {/* Requirements list */}
                    <div className="text-xs space-y-1">
                      <div className={cn(
                        'flex items-center gap-1',
                        passwordValidation.requirements.minLength ? 'text-green-400' : 'text-pewter'
                      )}>
                        {passwordValidation.requirements.minLength ? <Check className="w-3 h-3" /> : <span className="w-3 h-3 border border-current rounded-full" />}
                        <span>At least 8 characters</span>
                      </div>
                      <div className={cn(
                        'flex items-center gap-1',
                        passwordValidation.requirements.hasUppercase ? 'text-green-400' : 'text-pewter'
                      )}>
                        {passwordValidation.requirements.hasUppercase ? <Check className="w-3 h-3" /> : <span className="w-3 h-3 border border-current rounded-full" />}
                        <span>One uppercase letter</span>
                      </div>
                      <div className={cn(
                        'flex items-center gap-1',
                        passwordValidation.requirements.hasLowercase ? 'text-green-400' : 'text-pewter'
                      )}>
                        {passwordValidation.requirements.hasLowercase ? <Check className="w-3 h-3" /> : <span className="w-3 h-3 border border-current rounded-full" />}
                        <span>One lowercase letter</span>
                      </div>
                      <div className={cn(
                        'flex items-center gap-1',
                        passwordValidation.requirements.hasNumber ? 'text-green-400' : 'text-pewter'
                      )}>
                        {passwordValidation.requirements.hasNumber ? <Check className="w-3 h-3" /> : <span className="w-3 h-3 border border-current rounded-full" />}
                        <span>One number</span>
                      </div>
                      <div className={cn(
                        'flex items-center gap-1',
                        passwordValidation.requirements.hasSpecial ? 'text-green-400' : 'text-pewter'
                      )}>
                        {passwordValidation.requirements.hasSpecial ? <Check className="w-3 h-3" /> : <span className="w-3 h-3 border border-current rounded-full" />}
                        <span>One special character</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
              
              <div className="flex flex-col gap-3">
                <Button type="submit" className="w-full" disabled={isAuthLoading}>
        