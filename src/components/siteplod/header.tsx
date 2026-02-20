'use client'

import { useState, useEffect } from 'react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Upload, Zap, Menu, X, LogIn, UserPlus, LogOut, LayoutDashboard, Loader2, Check } from 'lucide-react'
import { toast } from 'sonner'
import { validateEmail, validatePassword, type PasswordValidation } from '@/lib/validation'
import { apiClient } from '@/lib/api-client'

interface HeaderProps {
  currentPage?: 'home' | 'upload' | 'dashboard'
  onNavigate?: (page: 'home' | 'upload' | 'dashboard') => void
}

export function Header({ currentPage = 'home', onNavigate }: HeaderProps) {
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [authDialogOpen, setAuthDialogOpen] = useState(false)
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login')
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [isAuthLoading, setIsAuthLoading] = useState(false)
  
  // Email validation state
  const [email, setEmail] = useState('')
  const [emailError, setEmailError] = useState<string | null>(null)
  
  // Password validation state
  const [password, setPassword] = useState('')
  const [passwordValidation, setPasswordValidation] = useState<PasswordValidation | null>(null)
  
  // Username state for registration
  const [username, setUsername] = useState('')

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])
  
  useEffect(() => {
    // Check if user is already logged in on mount
    const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null
    if (token) {
      setIsLoggedIn(true)
    }
    
    // Listen for auth state changes
    const handleAuthChange = () => {
      const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null
      setIsLoggedIn(!!token)
    }
    
    window.addEventListener('auth-state-changed', handleAuthChange)
    return () => window.removeEventListener('auth-state-changed', handleAuthChange)
  }, [])

  const handleNavigate = (page: 'home' | 'upload' | 'dashboard') => {
    onNavigate?.(page)
    setIsMobileMenuOpen(false)
  }

  const handleEmailChange = (value: string) => {
    setEmail(value)
    
    // Real-time validation
    const validation = validateEmail(value)
    setEmailError(validation.valid ? null : validation.error || null)
  }
  
  const handlePasswordChange = (value: string) => {
    setPassword(value)
    
    // Real-time validation
    const validation = validatePassword(value)
    setPasswordValidation(validation)
  }

  const resetAuthForm = () => {
    setUsername('')
    setEmail('')
    setEmailError(null)
    setPassword('')
    setPasswordValidation(null)
  }

  useEffect(() => {
    // Reset form when dialog opens/closes or mode changes
    if (!authDialogOpen) {
      resetAuthForm()
    }
  }, [authDialogOpen, authMode])

  return (
    <>
      <header
        className={cn(
          'fixed top-0 left-0 right-0 z-50 transition-all duration-500',
          isScrolled
            ? 'bg-obsidian/95 backdrop-blur-md border-b border-gold/20 shadow-gold'
            : 'bg-transparent'
        )}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            {/* Logo */}
            <button
              onClick={() => handleNavigate('home')}
              className="flex items-center gap-3 group"
            >
              <div className="relative">
                <div className="w-10 h-10 bg-gold rotate-45 transition-transform duration-300 group-hover:rotate-[405deg]">
                  <div className="absolute inset-0 flex items-center justify-center -rotate-45">
                    <Zap className="w-5 h-5 text-obsidian" />
                  </div>
                </div>
              </div>
              <span className="font-display text-2xl text-gold uppercase tracking-widest">
                SitePlod
              </span>
            </button>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-8">
              <button
                onClick={() => handleNavigate('home')}
                className={cn(
                  'text-sm uppercase tracking-widest transition-colors duration-300 art-deco-underline',
                  currentPage === 'home' ? 'text-gold' : 'text-champagne/70 hover:text-gold'
                )}
              >
                Home
              </button>
              <button
                onClick={() => handleNavigate('upload')}
                className={cn(
                  'text-sm uppercase tracking-widest transition-colors duration-300 art-deco-underline',
                  currentPage === 'upload' ? 'text-gold' : 'text-champagne/70 hover:text-gold'
                )}
              >
                Upload
              </button>
              <button
                onClick={() => {
                  if (currentPage !== 'home') {
                    handleNavigate('home')
                    setTimeout(() => {
                      const element = document.querySelector('#features')
                      if (element) {
                        const headerOffset = 80
                        const elementPosition = element.getBoundingClientRect().top
                        const offsetPosition = elementPosition + window.pageYOffset - headerOffset
                        window.scrollTo({ top: offsetPosition, behavior: 'smooth' })
                      }
                    }, 100)
                  } else {
                    const element = document.querySelector('#features')
                    if (element) {
                      const headerOffset = 80
                      const elementPosition = element.getBoundingClientRect().top
                      const offsetPosition = elementPosition + window.pageYOffset - headerOffset
                      window.scrollTo({ top: offsetPosition, behavior: 'smooth' })
                    }
                  }
                }}
                className="text-sm uppercase tracking-widest text-champagne/70 hover:text-gold transition-colors duration-300 art-deco-underline"
              >
                Features
              </button>
              <button
                onClick={() => {
                  if (currentPage !== 'home') {
                    handleNavigate('home')
                    setTimeout(() => {
                      const element = document.querySelector('#pricing')
                      if (element) {
                        const headerOffset = 80
                        const elementPosition = element.getBoundingClientRect().top
                        const offsetPosition = elementPosition + window.pageYOffset - headerOffset
                        window.scrollTo({ top: offsetPosition, behavior: 'smooth' })
                      }
                    }, 100)
                  } else {
                    const element = document.querySelector('#pricing')
                    if (element) {
                      const headerOffset = 80
                      const elementPosition = element.getBoundingClientRect().top
                      const offsetPosition = elementPosition + window.pageYOffset - headerOffset
                      window.scrollTo({ top: offsetPosition, behavior: 'smooth' })
                    }
                  }
                }}
                className="text-sm uppercase tracking-widest text-champagne/70 hover:text-gold transition-colors duration-300 art-deco-underline"
              >
                Pricing
              </button>
            </nav>

            {/* Desktop Actions */}
            <div className="hidden md:flex items-center gap-4">
              {isLoggedIn ? (
                <>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleNavigate('dashboard')}
                    className="gap-2"
                  >
                    <LayoutDashboard className="w-4 h-4" />
                    Dashboard
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={async () => {
                      try {
                        await apiClient.logout()
                        setIsLoggedIn(false)
                        
                        // Dispatch event for other components
                        window.dispatchEvent(new Event('auth-state-changed'))
                        
                        toast.success('Logged out', {
                          description: 'You have been successfully logged out'
                        })
                      } catch (error) {
                        console.error('Logout error:', error)
                        // Still log out locally even if API call fails
                        setIsLoggedIn(false)
                        window.dispatchEvent(new Event('auth-state-changed'))
                      }
                    }}
                    className="gap-2"
                  >
                    <LogOut className="w-4 h-4" />
                    Logout
                  </Button>
                </>
              ) : (
                <>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setAuthMode('login')
                      setAuthDialogOpen(true)
                    }}
                    className="gap-2"
                    data-login-button
                  >
                    <LogIn className="w-4 h-4" />
                    Login
                  </Button>
                  <Button
                    variant="default"
                    size="sm"
                    onClick={() => handleNavigate('upload')}
                    className="gap-2"
                  >
                    <Upload className="w-4 h-4" />
                    Deploy Now
                  </Button>
                </>
              )}
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 text-gold"
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        <div
          className={cn(
            'md:hidden absolute top-20 left-0 right-0 bg-obsidian/95 backdrop-blur-md border-b border-gold/20 transition-all duration-300 overflow-hidden',
            isMobileMenuOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
          )}
        >
          <nav className="flex flex-col p-6 gap-4">
            <button
              onClick={() => handleNavigate('home')}
              className={cn(
                'text-left text-sm uppercase tracking-widest py-2 border-b border-gold/10',
                currentPage === 'home' ? 'text-gold' : 'text-champagne/70'
              )}
            >
              Home
            </button>
            <button
              onClick={() => handleNavigate('upload')}
              className={cn(
                'text-left text-sm uppercase tracking-widest py-2 border-b border-gold/10',
                currentPage === 'upload' ? 'text-gold' : 'text-champagne/70'
              )}
            >
              Upload
            </button>
            <button
              onClick={() => {
                setIsMobileMenuOpen(false)
                if (currentPage !== 'home') {
                  handleNavigate('home')
                  setTimeout(() => {
                    const element = document.querySelector('#features')
                    if (element) {
                      const headerOffset = 80
                      const elementPosition = element.getBoundingClientRect().top
                      const offsetPosition = elementPosition + window.pageYOffset - headerOffset
                      window.scrollTo({ top: offsetPosition, behavior: 'smooth' })
                    }
                  }, 100)
                } else {
                  const element = document.querySelector('#features')
                  if (element) {
                    const headerOffset = 80
                    const elementPosition = element.getBoundingClientRect().top
                    const offsetPosition = elementPosition + window.pageYOffset - headerOffset
                    window.scrollTo({ top: offsetPosition, behavior: 'smooth' })
                  }
                }
              }}
              className="text-left text-sm uppercase tracking-widest text-champagne/70 py-2 border-b border-gold/10"
            >
              Features
            </button>
            <button
              onClick={() => {
                setIsMobileMenuOpen(false)
                if (currentPage !== 'home') {
                  handleNavigate('home')
                  setTimeout(() => {
                    const element = document.querySelector('#pricing')
                    if (element) {
                      const headerOffset = 80
                      const elementPosition = element.getBoundingClientRect().top
                      const offsetPosition = elementPosition + window.pageYOffset - headerOffset
                      window.scrollTo({ top: offsetPosition, behavior: 'smooth' })
                    }
                  }, 100)
                } else {
                  const element = document.querySelector('#pricing')
                  if (element) {
                    const headerOffset = 80
                    const elementPosition = element.getBoundingClientRect().top
                    const offsetPosition = elementPosition + window.pageYOffset - headerOffset
                    window.scrollTo({ top: offsetPosition, behavior: 'smooth' })
                  }
                }
              }}
              className="text-left text-sm uppercase tracking-widest text-champagne/70 py-2 border-b border-gold/10"
            >
              Pricing
            </button>
            <div className="flex flex-col gap-3 pt-4">
              {isLoggedIn ? (
                <>
                  <Button
                    variant="ghost"
                    onClick={() => handleNavigate('dashboard')}
                    className="w-full justify-center"
                  >
                    Dashboard
                  </Button>
                  <Button
                    variant="outline"
                    onClick={async () => {
                      try {
                        await apiClient.logout()
                        setIsLoggedIn(false)
                        
                        // Dispatch event for other components
                        window.dispatchEvent(new Event('auth-state-changed'))
                        
                        toast.success('Logged out', {
                          description: 'You have been successfully logged out'
                        })
                      } catch (error) {
                        console.error('Logout error:', error)
                        // Still log out locally even if API call fails
                        setIsLoggedIn(false)
                        window.dispatchEvent(new Event('auth-state-changed'))
                      }
                    }}
                    className="w-full"
                  >
                    Logout
                  </Button>
                </>
              ) : (
                <>
                  <Button
                    variant="ghost"
                    onClick={() => {
                      setAuthMode('login')
                      setAuthDialogOpen(true)
                      setIsMobileMenuOpen(false)
                    }}
                    className="w-full"
                    data-login-button
                  >
                    Login
                  </Button>
                  <Button
                    variant="default"
                    onClick={() => handleNavigate('upload')}
                    className="w-full"
                  >
                    Deploy Now
                  </Button>
                </>
              )}
            </div>
          </nav>
        </div>
      </header>

      {/* Auth Dialog */}
      <Dialog open={authDialogOpen} onOpenChange={setAuthDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {authMode === 'login' ? 'Welcome Back' : 'Create Account'}
            </DialogTitle>
            <DialogDescription>
              {authMode === 'login'
                ? 'Sign in to manage your deployed sites.'
                : 'Register to save and manage your sites with a personalized dashboard.'}
            </DialogDescription>
          </DialogHeader>
          
          <form className="space-y-6 pt-4" onSubmit={async (e) => {
            e.preventDefault()
            
            // Prevent double submission
            if (isAuthLoading) return
            
            setIsAuthLoading(true)
            
            try {
              if (authMode === 'login') {
                // Login
                const response = await apiClient.login({
                  email,
                  password
                })
                
                setIsLoggedIn(true)
                setAuthDialogOpen(false)
                
                // Dispatch event for other components
                window.dispatchEvent(new Event('auth-state-changed'))
                
                toast.success('Welcome back!', {
                  description: 'You have successfully logged in'
                })
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
                  setAuthDialogOpen(false)
                  toast.success('Check your email!', {
                    description: 'We sent you a verification link. Please check your inbox.',
                    duration: 6000
                  })
                } else {
                  // Auto-login if no verification required
                  setIsLoggedIn(true)
                  setAuthDialogOpen(false)
                  
                  // Dispatch event for other components
                  window.dispatchEvent(new Event('auth-state-changed'))
                  
                  toast.success('Account created!', {
                    description: 'Welcome to SitePlod'
                  })
                }
              }
            } catch (error: any) {
              console.error('Auth error:', error)
              
              // Handle email verification required error
              if (error.data?.requiresVerification) {
                toast.error('Email not verified', {
                  description: 'Please check your email and click the verification link.',
                  duration: 6000,
                  action: {
                    label: 'Resend',
                    onClick: async () => {
                      try {
                        await apiClient.resendVerification(email)
                        toast.success('Email sent!', {
                          description: 'Check your inbox for the verification link.'
                        })
                      } catch (err) {
                        toast.error('Failed to resend', {
                          description: 'Please try again later.'
                        })
                      }
                    }
                  }
                })
              } else {
                toast.error(authMode === 'login' ? 'Login failed' : 'Registration failed', {
                  description: error.message || 'Please check your credentials and try again'
                })
              }
            } finally {
              setIsAuthLoading(false)
            }
          }}>
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
              {passwordValidation?.error && (
                <p className="text-sm text-red-400">{passwordValidation.error}</p>
              )}
              {password && passwordValidation && (
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
                {isAuthLoading ? (
                  <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Processing...</>
                ) : authMode === 'login' ? (
                  <><LogIn className="w-4 h-4 mr-2" /> Sign In</>
                ) : (
                  <><UserPlus className="w-4 h-4 mr-2" /> Create Account</>
                )}
              </Button>
              <button
                type="button"
                onClick={() => setAuthMode(authMode === 'login' ? 'register' : 'login')}
                className="text-sm text-pewter hover:text-gold transition-colors"
                disabled={isAuthLoading}
              >
                {authMode === 'login'
                  ? "Don't have an account? Register"
                  : 'Already have an account? Sign in'}
              </button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </>
  )
}
