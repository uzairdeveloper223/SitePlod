'use client'

import { useState, useEffect } from 'react'
import { User, Calendar, Mail, Eye, Globe, Edit2, X, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardContent, CardCornerDecorations } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { validateEmail, validatePassword, validateUsername, type PasswordValidation } from '@/lib/validation'
import { apiClient } from '@/lib/api-client'
import { handleApiError } from '@/lib/error-handler'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import type { User as UserType } from '@/lib/api-types'

export default function ProfilePage() {
  const [user, setUser] = useState<UserType | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [loading, setLoading] = useState(true)
  const [totalSites, setTotalSites] = useState(0)
  const [totalViews, setTotalViews] = useState(0)

  // Form state for editing
  const [editedUsername, setEditedUsername] = useState('')
  const [editedEmail, setEditedEmail] = useState('')
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')

  // Validation state
  const [usernameError, setUsernameError] = useState<string | null>(null)
  const [emailError, setEmailError] = useState<string | null>(null)
  const [currentPasswordError, setCurrentPasswordError] = useState<string | null>(null)
  const [newPasswordValidation, setNewPasswordValidation] = useState<PasswordValidation | null>(null)
  const [confirmPasswordError, setConfirmPasswordError] = useState<string | null>(null)

  useEffect(() => {
    loadUserData()
  }, [])

  const loadUserData = async () => {
    try {
      setLoading(true)
      
      // Fetch user profile
      const userData = await apiClient.getProfile()
      setUser(userData)
      setEditedUsername(userData.username)
      setEditedEmail(userData.email)
      
      // Fetch user's sites to calculate stats
      const sites = await apiClient.getSites()
      setTotalSites(sites.length)
      const views = sites.reduce((sum, site) => sum + site.views, 0)
      setTotalViews(views)
    } catch (error) {
      console.error('Failed to load user data:', error)
      const errorMessage = handleApiError(error)
      toast.error('Failed to load profile', {
        description: errorMessage
      })
    } finally {
      setLoading(false)
    }
  }

  const handleSaveProfile = async () => {
    if (!user) return

    // Validate all fields before submission
    const usernameValidation = validateUsername(editedUsername)
    const emailValidation = validateEmail(editedEmail)
    
    setUsernameError(usernameValidation.valid ? null : usernameValidation.error || null)
    setEmailError(emailValidation.valid ? null : emailValidation.error || null)

    // If changing password, validate password fields
    if (newPassword || currentPassword || confirmPassword) {
      if (!currentPassword) {
        setCurrentPasswordError('Current password is required to change password')
        return
      }

      const passwordValidation = validatePassword(newPassword)
      if (!passwordValidation.valid) {
        setNewPasswordValidation(passwordValidation)
        return
      }

      if (newPassword !== confirmPassword) {
        setConfirmPasswordError('Passwords do not match')
        return
      }
    }

    // Stop if there are validation errors
    if (!usernameValidation.valid || !emailValidation.valid) {
      return
    }

    try {
      // Update profile with API
      const updatedUser = await apiClient.updateProfile({
        username: editedUsername,
        email: editedEmail,
        ...(newPassword && { currentPassword, newPassword })
      })
      setUser(updatedUser)
      
      // Clear password fields
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
      setNewPasswordValidation(null)
      
      setIsEditing(false)
      
      // Show success toast
      toast.success('Profile updated', {
        description: 'Your profile has been successfully updated'
      })
    } catch (error) {
      console.error('Failed to update profile:', error)
      const errorMessage = handleApiError(error)
      toast.error('Failed to update profile', {
        description: errorMessage
      })
    }
  }

  const handleCancelEdit = () => {
    if (user) {
      setEditedUsername(user.username)
      setEditedEmail(user.email)
    }
    // Clear password fields
    setCurrentPassword('')
    setNewPassword('')
    setConfirmPassword('')
    // Clear validation errors
    setUsernameError(null)
    setEmailError(null)
    setCurrentPasswordError(null)
    setNewPasswordValidation(null)
    setConfirmPasswordError(null)
    setIsEditing(false)
  }

  const handleUsernameChange = (value: string) => {
    setEditedUsername(value)
    
    // Real-time validation
    const validation = validateUsername(value)
    setUsernameError(validation.valid ? null : validation.error || null)
  }

  const handleEmailChange = (value: string) => {
    setEditedEmail(value)
    
    // Real-time validation
    const validation = validateEmail(value)
    setEmailError(validation.valid ? null : validation.error || null)
  }

  const handleNewPasswordChange = (value: string) => {
    setNewPassword(value)
    
    // Real-time validation
    const validation = validatePassword(value)
    setNewPasswordValidation(validation)
    
    // Check if passwords match
    if (confirmPassword && value !== confirmPassword) {
      setConfirmPasswordError('Passwords do not match')
    } else {
      setConfirmPasswordError(null)
    }
  }

  const handleConfirmPasswordChange = (value: string) => {
    setConfirmPassword(value)
    
    // Check if passwords match
    if (newPassword && value !== newPassword) {
      setConfirmPasswordError('Passwords do not match')
    } else {
      setConfirmPasswordError(null)
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  if (loading) {
    return (
      <div className="min-h-screen pt-32 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="animate-pulse">
            <div className="h-10 bg-charcoal border border-gold/20 w-48 mb-8" />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-32 bg-charcoal border border-gold/20" />
              ))}
            </div>
            <div className="h-96 bg-charcoal border border-gold/20" />
          </div>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen pt-32 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <Card>
            <CardCornerDecorations />
            <CardContent className="p-12 text-center">
              <p className="text-pewter">Failed to load profile data. Please try again.</p>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen pt-32 pb-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-12">
          <h1 className="font-display text-4xl text-gold uppercase tracking-widest">
            Profile Settings
          </h1>
          {!isEditing ? (
            <Button
              variant="outline"
              onClick={() => setIsEditing(true)}
              className="gap-2"
            >
              <Edit2 className="w-4 h-4" />
              Edit Profile
            </Button>
          ) : (
            <div className="flex gap-3">
              <Button
                variant="ghost"
                onClick={handleCancelEdit}
                className="gap-2"
              >
                <X className="w-4 h-4" />
                Cancel
              </Button>
              <Button
                variant="solid"
                onClick={handleSaveProfile}
                className="gap-2"
              >
                <Check className="w-4 h-4" />
                Save Changes
              </Button>
            </div>
          )}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {[
            { label: 'Total Sites', value: totalSites, icon: Globe },
            { label: 'Total Views', value: totalViews.toLocaleString(), icon: Eye },
            { label: 'Member Since', value: formatDate(user.createdAt).split(',')[0], icon: Calendar }
          ].map((stat, index) => {
            const Icon = stat.icon
            return (
              <div key={index} className="bg-charcoal border border-gold/20 p-6 relative group">
                <div className="absolute top-2 right-2 w-4 h-4 border-t-2 border-r-2 border-gold/30" aria-hidden="true" />
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-obsidian border border-gold/30 flex items-center justify-center">
                    <Icon className="w-6 h-6 text-gold" />
                  </div>
                  <div>
                    <p className="text-pewter text-sm uppercase tracking-wide">{stat.label}</p>
                    <p className="font-display text-2xl text-gold">{stat.value}</p>
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {/* Profile Information */}
        <Card>
          <CardCornerDecorations />
          <CardHeader>
            <CardTitle>Account Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6 pt-6">
            {/* Username */}
            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              {isEditing ? (
                <>
                  <div className="relative">
                    <Input
                      id="username"
                      value={editedUsername}
                      onChange={(e) => handleUsernameChange(e.target.value)}
                      placeholder="Enter username"
                      className={usernameError ? 'border-red-500' : !usernameError && editedUsername ? 'border-green-500' : ''}
                    />
                  </div>
                  {usernameError && (
                    <p className="text-sm text-red-400">{usernameError}</p>
                  )}
                  {!usernameError && editedUsername && (
                    <p className="text-sm text-green-400 flex items-center gap-1">
                      <Check className="w-4 h-4" /> Valid username
                    </p>
                  )}
                </>
              ) : (
                <div className="flex items-center gap-3 py-2">
                  <User className="w-5 h-5 text-gold" />
                  <span className="text-champagne text-lg">{user.username}</span>
                </div>
              )}
            </div>

            {/* Email */}
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              {isEditing ? (
                <>
                  <Input
                    id="email"
                    type="email"
                    value={editedEmail}
                    onChange={(e) => handleEmailChange(e.target.value)}
                    placeholder="Enter email"
                    className={emailError ? 'border-red-500' : !emailError && editedEmail ? 'border-green-500' : ''}
                  />
                  {emailError && (
                    <p className="text-sm text-red-400">{emailError}</p>
                  )}
                  {!emailError && editedEmail && (
                    <p className="text-sm text-green-400 flex items-center gap-1">
                      <Check className="w-4 h-4" /> Valid email
                    </p>
                  )}
                </>
              ) : (
                <div className="flex items-center gap-3 py-2">
                  <Mail className="w-5 h-5 text-gold" />
                  <span className="text-champagne text-lg">{user.email}</span>
                </div>
              )}
            </div>

            {/* Password Change Section - Only shown when editing */}
            {isEditing && (
              <>
                <div className="border-t border-gold/20 pt-6 mt-6">
                  <h3 className="font-display text-xl text-gold uppercase tracking-widest mb-4">
                    Change Password
                  </h3>
                  <p className="text-sm text-pewter mb-4">
                    Leave blank to keep your current password
                  </p>

                  {/* Current Password */}
                  <div className="space-y-2 mb-4">
                    <Label htmlFor="currentPassword">Current Password</Label>
                    <Input
                      id="currentPassword"
                      type="password"
                      value={currentPassword}
                      onChange={(e) => {
                        setCurrentPassword(e.target.value)
                        setCurrentPasswordError(null)
                      }}
                      placeholder="Enter current password"
                      className={currentPasswordError ? 'border-red-500' : ''}
                    />
                    {currentPasswordError && (
                      <p className="text-sm text-red-400">{currentPasswordError}</p>
                    )}
                  </div>

                  {/* New Password */}
                  <div className="space-y-2 mb-4">
                    <Label htmlFor="newPassword">New Password</Label>
                    <Input
                      id="newPassword"
                      type="password"
                      value={newPassword}
                      onChange={(e) => handleNewPasswordChange(e.target.value)}
                      placeholder="Enter new password"
                      className={newPasswordValidation?.error ? 'border-red-500' : !newPasswordValidation?.error && newPassword ? 'border-green-500' : ''}
                    />
                    {newPasswordValidation?.error && (
                      <p className="text-sm text-red-400">{newPasswordValidation.error}</p>
                    )}
                    {newPassword && newPasswordValidation && (
                      <div className="space-y-2">
                        {/* Strength indicator */}
                        <div className="flex items-center gap-2">
                          <div className="flex-1 h-2 bg-obsidian border border-gold/30 overflow-hidden">
                            <div 
                              className={cn(
                                'h-full transition-all duration-300',
                                newPasswordValidation.strength === 'weak' && 'w-1/4 bg-red-500',
                                newPasswordValidation.strength === 'fair' && 'w-2/4 bg-yellow-500',
                                newPasswordValidation.strength === 'good' && 'w-3/4 bg-blue-500',
                                newPasswordValidation.strength === 'strong' && 'w-full bg-green-500'
                              )}
                            />
                          </div>
                          <span className={cn(
                            'text-xs uppercase tracking-wide',
                            newPasswordValidation.strength === 'weak' && 'text-red-400',
                            newPasswordValidation.strength === 'fair' && 'text-yellow-400',
                            newPasswordValidation.strength === 'good' && 'text-blue-400',
                            newPasswordValidation.strength === 'strong' && 'text-green-400'
                          )}>
                            {newPasswordValidation.strength}
                          </span>
                        </div>
                        
                        {/* Requirements list */}
                        <div className="text-xs space-y-1">
                          <div className={cn(
                            'flex items-center gap-1',
                            newPasswordValidation.requirements.minLength ? 'text-green-400' : 'text-pewter'
                          )}>
                            {newPasswordValidation.requirements.minLength ? <Check className="w-3 h-3" /> : <span className="w-3 h-3 border border-current rounded-full" />}
                            <span>At least 8 characters</span>
                          </div>
                          <div className={cn(
                            'flex items-center gap-1',
                            newPasswordValidation.requirements.hasUppercase ? 'text-green-400' : 'text-pewter'
                          )}>
                            {newPasswordValidation.requirements.hasUppercase ? <Check className="w-3 h-3" /> : <span className="w-3 h-3 border border-current rounded-full" />}
                            <span>One uppercase letter</span>
                          </div>
                          <div className={cn(
                            'flex items-center gap-1',
                            newPasswordValidation.requirements.hasLowercase ? 'text-green-400' : 'text-pewter'
                          )}>
                            {newPasswordValidation.requirements.hasLowercase ? <Check className="w-3 h-3" /> : <span className="w-3 h-3 border border-current rounded-full" />}
                            <span>One lowercase letter</span>
                          </div>
                          <div className={cn(
                            'flex items-center gap-1',
                            newPasswordValidation.requirements.hasNumber ? 'text-green-400' : 'text-pewter'
                          )}>
                            {newPasswordValidation.requirements.hasNumber ? <Check className="w-3 h-3" /> : <span className="w-3 h-3 border border-current rounded-full" />}
                            <span>One number</span>
                          </div>
                          <div className={cn(
                            'flex items-center gap-1',
                            newPasswordValidation.requirements.hasSpecial ? 'text-green-400' : 'text-pewter'
                          )}>
                            {newPasswordValidation.requirements.hasSpecial ? <Check className="w-3 h-3" /> : <span className="w-3 h-3 border border-current rounded-full" />}
                            <span>One special character</span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Confirm Password */}
                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">Confirm New Password</Label>
                    <Input
                      id="confirmPassword"
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => handleConfirmPasswordChange(e.target.value)}
                      placeholder="Confirm new password"
                      className={confirmPasswordError ? 'border-red-500' : !confirmPasswordError && confirmPassword ? 'border-green-500' : ''}
                    />
                    {confirmPasswordError && (
                      <p className="text-sm text-red-400">{confirmPasswordError}</p>
                    )}
                    {!confirmPasswordError && confirmPassword && newPassword === confirmPassword && (
                      <p className="text-sm text-green-400 flex items-center gap-1">
                        <Check className="w-4 h-4" /> Passwords match
                      </p>
                    )}
                  </div>
                </div>
              </>
            )}

            {/* Account Creation Date */}
            <div className="space-y-2">
              <Label>Account Created</Label>
              <div className="flex items-center gap-3 py-2">
                <Calendar className="w-5 h-5 text-gold" />
                <span className="text-champagne text-lg">{formatDate(user.createdAt)}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
