import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { supabase } from '@/lib/supabase'
import type { Profile, UserRole } from '@/types'

interface AuthState {
  user: Profile | null
  role: UserRole | null
  isLoading: boolean
  isInitialized: boolean
  isAuthenticated: boolean
  sessionExpiry: string | null
  setUser: (user: Profile | null) => void
  setRole: (role: UserRole | null) => void
  setLoading: (loading: boolean) => void
  signOut: () => Promise<void>
  initialize: () => Promise<void>
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      role: null,
      isLoading: true,
      isInitialized: false,
      isAuthenticated: false,
      sessionExpiry: null,

      setUser: (user) => set({
        user,
        role: user?.role ?? null,
        isAuthenticated: !!user,
      }),

      setRole: (role) => set({ role }),
      setLoading: (isLoading) => set({ isLoading }),

      signOut: async () => {
        await supabase.auth.signOut()
        set({
          user: null,
          role: null,
          isAuthenticated: false,
          sessionExpiry: null,
          isInitialized: true,
        })
      },

      initialize: async () => {
        console.log('[GFS Auth DEBUG] initialize start, setting isLoading: true')
        set({ isLoading: true })
        
        // Transparent Offline Demo mode check
        if ((supabase as any).supabaseUrl.includes('placeholder-project.supabase.co')) {
          console.warn('[GFS Auth] Running in Offline Demo Mode. Bypassing network initialization.')
          const current = get()
          if (current.isAuthenticated && current.user) {
            console.log('[GFS Auth DEBUG] Offline Demo Mode: already authenticated, setting isLoading: false, isInitialized: true')
            set({ isLoading: false, isInitialized: true })
            return
          }
          console.log('[GFS Auth DEBUG] Offline Demo Mode: resetting auth state, setting isLoading: false, isInitialized: true')
          set({ user: null, role: null, isAuthenticated: false, isLoading: false, isInitialized: true })
          return
        }

        try {
          console.log('[GFS Auth DEBUG] Calling supabase.auth.getSession()...')
          const { data: { session } } = await supabase.auth.getSession()
          console.log('[GFS Auth DEBUG] getSession resolved. Session exists:', !!session)
          
          if (session?.user) {
            console.log('[GFS Auth DEBUG] Session user ID:', session.user.id)
            console.log('[GFS Auth DEBUG] Fetching profile from database...')
            const { data: profile, error } = await supabase
              .from('profiles')
              .select('*')
              .eq('user_id', session.user.id)
              .single()

            if (error) {
              console.error('[GFS Auth DEBUG] Fetch profile error:', error)
            } else {
              console.log('[GFS Auth DEBUG] Profile fetched successfully:', profile)
            }

            if (profile) {
              set({
                user: profile as Profile,
                role: profile.role as UserRole,
                isAuthenticated: true,
                sessionExpiry: session.expires_at
                  ? new Date(session.expires_at * 1000).toISOString()
                  : null,
              })
              console.log('[GFS Auth DEBUG] Set authenticated user state.')
            } else {
              console.warn('[GFS Auth DEBUG] Profile not found in database for logged-in user.')
            }
          } else {
            console.log('[GFS Auth DEBUG] No active session found on Supabase server.')
          }
        } catch (error) {
          console.error('[GFS Auth DEBUG] Initialization error caught:', error)
          set({ user: null, role: null, isAuthenticated: false })
        } finally {
          console.log('[GFS Auth DEBUG] Finally block: setting isLoading: false, isInitialized: true')
          set({ isLoading: false, isInitialized: true })
        }
      },
    }),
    {
      name: 'gfs-auth',
      storage: createJSONStorage(() => sessionStorage),
      partialize: (state) => ({
        user: state.user,
        role: state.role,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
)
