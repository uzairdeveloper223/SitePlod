/**
 * Supabase Client Utilities
 * 
 * This module provides Supabase client instances for different use cases:
 * - Admin client: Uses service key for privileged operations
 * - Anon client: Uses anon key for public operations
 * 
 * Requirements: 1, 20
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js'
import { getEnv } from './env-validation'

/**
 * Database types for type-safe queries
 */
export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          username: string
          email: string
          notification: string[]
          cli_announced: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          username: string
          email: string
          notification?: string[]
          cli_announced?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          username?: string
          email?: string
          notification?: string[]
          cli_announced?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      sites: {
        Row: {
          id: string
          user_id: string | null
          name: string
          slug: string
          managed: boolean
          views: number
          status: 'live' | 'draft' | 'archived'
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id?: string | null
          name: string
          slug: string
          managed?: boolean
          views?: number
          status?: 'live' | 'draft' | 'archived'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string | null
          name?: string
          slug?: string
          managed?: boolean
          views?: number
          status?: 'live' | 'draft' | 'archived'
          created_at?: string
          updated_at?: string
        }
      }
      site_files: {
        Row: {
          id: string
          site_id: string
          path: string
          storage_url: string
          mime_type: string
          size: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          site_id: string
          path: string
          storage_url: string
          mime_type: string
          size: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          site_id?: string
          path?: string
          storage_url?: string
          mime_type?: string
          size?: number
          created_at?: string
          updated_at?: string
        }
      }
      site_views: {
        Row: {
          id: string
          site_id: string
          viewed_at: string
          referrer: string | null
        }
        Insert: {
          id?: string
          site_id: string
          viewed_at?: string
          referrer?: string | null
        }
        Update: {
          id?: string
          site_id?: string
          viewed_at?: string
          referrer?: string | null
        }
      }
    }
  }
}

/**
 * Admin Supabase client with service key
 * Use for privileged operations that bypass RLS
 */
let adminClient: SupabaseClient<Database> | null = null

export function getAdminClient(): SupabaseClient<Database> {
  if (!adminClient) {
    try {
      const env = getEnv()

      if (!env.SUPABASE_URL) {
        throw new Error('SUPABASE_URL is not configured')
      }

      if (!env.SUPABASE_SERVICE_KEY) {
        throw new Error('SUPABASE_SERVICE_KEY is not configured')
      }

      adminClient = createClient<Database>(
        env.SUPABASE_URL,
        env.SUPABASE_SERVICE_KEY,
        {
          auth: {
            autoRefreshToken: false,
            persistSession: false
          }
        }
      )
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error'
      throw new Error(`Failed to initialize Supabase admin client: ${message}`)
    }
  }

  return adminClient
}

/**
 * Anonymous Supabase client with anon key
 * Use for public operations and client-side auth
 */
let anonClient: SupabaseClient<Database> | null = null

export function getAnonClient(): SupabaseClient<Database> {
  if (!anonClient) {
    try {
      const env = getEnv()

      if (!env.SUPABASE_URL) {
        throw new Error('SUPABASE_URL is not configured')
      }

      if (!env.SUPABASE_ANON_KEY) {
        throw new Error('SUPABASE_ANON_KEY is not configured')
      }

      anonClient = createClient<Database>(
        env.SUPABASE_URL,
        env.SUPABASE_ANON_KEY,
        {
          auth: {
            autoRefreshToken: true,
            persistSession: true
          }
        }
      )
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error'
      throw new Error(`Failed to initialize Supabase anon client: ${message}`)
    }
  }

  return anonClient
}

/**
 * Server Supabase client with anon key
 * Use for server-side operations that need auth context
 * This is similar to anonClient but doesn't persist sessions
 */
export function getServerClient(): SupabaseClient<Database> {
  try {
    const env = getEnv()

    if (!env.SUPABASE_URL) {
      throw new Error('SUPABASE_URL is not configured')
    }

    if (!env.SUPABASE_ANON_KEY) {
      throw new Error('SUPABASE_ANON_KEY is not configured')
    }

    return createClient<Database>(
      env.SUPABASE_URL,
      env.SUPABASE_ANON_KEY,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
          detectSessionInUrl: false
        }
      }
    )
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    throw new Error(`Failed to initialize Supabase server client: ${message}`)
  }
}

/**
 * Create a Supabase client with a specific access token
 * Use for authenticated API routes
 */
export function createAuthClient(accessToken: string): SupabaseClient<Database> {
  try {
    const env = getEnv()

    if (!env.SUPABASE_URL) {
      throw new Error('SUPABASE_URL is not configured')
    }

    if (!env.SUPABASE_ANON_KEY) {
      throw new Error('SUPABASE_ANON_KEY is not configured')
    }

    return createClient<Database>(
      env.SUPABASE_URL,
      env.SUPABASE_ANON_KEY,
      {
        global: {
          headers: {
            Authorization: `Bearer ${accessToken}`
          }
        },
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    )
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    throw new Error(`Failed to create authenticated Supabase client: ${message}`)
  }
}

/**
 * Clear cached clients (useful for testing)
 */
export function clearClientCache(): void {
  adminClient = null
  anonClient = null
}
