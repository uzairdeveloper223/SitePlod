/**
 * Environment Variables Validation
 * 
 * This module validates that all required environment variables are present
 * and properly configured before the application starts.
 * 
 * Requirements: 20
 */

interface EnvConfig {
  // Supabase
  SUPABASE_URL: string
  SUPABASE_ANON_KEY: string
  SUPABASE_SERVICE_KEY: string
  
  // External Services
  PASTEBIN_API_KEY: string
  IMGBB_API_KEY: string
  
  // Application
  NEXT_PUBLIC_BASE_URL: string
  JWT_SECRET: string
  
  // Optional
  SMTP_USER?: string
  SMTP_PASSWORD?: string
  REDIS_URL?: string
  NODE_ENV?: string
}

/**
 * List of required environment variables
 */
const REQUIRED_ENV_VARS = [
  'SUPABASE_URL',
  'SUPABASE_ANON_KEY',
  'SUPABASE_SERVICE_KEY',
  'PASTEBIN_API_KEY',
  'IMGBB_API_KEY',
  'NEXT_PUBLIC_BASE_URL',
  'JWT_SECRET',
] as const

/**
 * Validates that all required environment variables are present
 * @throws Error if any required variable is missing
 */
export function validateEnv(): EnvConfig {
  const missing: string[] = []
  const invalid: string[] = []

  // Check for missing required variables
  for (const varName of REQUIRED_ENV_VARS) {
    const value = process.env[varName]
    
    if (!value || value.trim() === '') {
      missing.push(varName)
    }
  }

  // Validate specific formats
  if (process.env.SUPABASE_URL && !process.env.SUPABASE_URL.startsWith('https://')) {
    invalid.push('SUPABASE_URL must start with https://')
  }

  if (process.env.NEXT_PUBLIC_BASE_URL && 
      !process.env.NEXT_PUBLIC_BASE_URL.startsWith('http://') && 
      !process.env.NEXT_PUBLIC_BASE_URL.startsWith('https://')) {
    invalid.push('NEXT_PUBLIC_BASE_URL must start with http:// or https://')
  }

  if (process.env.JWT_SECRET && process.env.JWT_SECRET.length < 32) {
    invalid.push('JWT_SECRET must be at least 32 characters long')
  }

  // Report errors
  if (missing.length > 0 || invalid.length > 0) {
    const errorMessages: string[] = [
      '❌ Environment variable validation failed!',
      '',
    ]

    if (missing.length > 0) {
      errorMessages.push('Missing required environment variables:')
      missing.forEach(varName => {
        errorMessages.push(`  - ${varName}`)
      })
      errorMessages.push('')
    }

    if (invalid.length > 0) {
      errorMessages.push('Invalid environment variable values:')
      invalid.forEach(msg => {
        errorMessages.push(`  - ${msg}`)
      })
      errorMessages.push('')
    }

    errorMessages.push('Please check your .env file and ensure all required variables are set.')
    errorMessages.push('See .env.example for reference.')

    throw new Error(errorMessages.join('\n'))
  }

  // Return validated config
  return {
    SUPABASE_URL: process.env.SUPABASE_URL!,
    SUPABASE_ANON_KEY: process.env.SUPABASE_ANON_KEY!,
    SUPABASE_SERVICE_KEY: process.env.SUPABASE_SERVICE_KEY!,
    PASTEBIN_API_KEY: process.env.PASTEBIN_API_KEY!,
    IMGBB_API_KEY: process.env.IMGBB_API_KEY!,
    NEXT_PUBLIC_BASE_URL: process.env.NEXT_PUBLIC_BASE_URL!,
    JWT_SECRET: process.env.JWT_SECRET!,
    SMTP_USER: process.env.SMTP_USER,
    SMTP_PASSWORD: process.env.SMTP_PASSWORD,
    REDIS_URL: process.env.REDIS_URL,
    NODE_ENV: process.env.NODE_ENV || 'development',
  }
}

/**
 * Get validated environment configuration
 * Caches the result after first validation
 */
let cachedEnv: EnvConfig | null = null

export function getEnv(): EnvConfig {
  if (!cachedEnv) {
    cachedEnv = validateEnv()
  }
  return cachedEnv
}

/**
 * Clear cached environment (useful for testing)
 */
export function clearEnvCache(): void {
  cachedEnv = null
}

/**
 * Check if email is configured
 */
export function isEmailConfigured(): boolean {
  const env = getEnv()
  return !!(env.SMTP_USER && env.SMTP_PASSWORD)
}

/**
 * Check if Redis is configured
 */
export function isRedisConfigured(): boolean {
  const env = getEnv()
  return !!env.REDIS_URL
}
