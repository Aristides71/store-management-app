import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuthStore } from '../stores/authStore'

interface AuthProviderProps {
  children: React.ReactNode
}

export default function AuthProvider({ children }: AuthProviderProps) {
  const navigate = useNavigate()
  const { user, setUser, setIsLoading, setStore } = useAuthStore()

  useEffect(() => {
    supabase.auth.getSession()
    .then(async ({ data: { session } }) => {
      if (session?.user) {
        setUser({
          id: session.user.id,
          email: session.user.email!,
          role: 'admin',
          created_at: session.user.created_at
        })
        const { data: stores } = await supabase
          .from('stores')
          .select('*')
          .eq('owner_id', session.user.id)
          .limit(1)
        if (stores && stores.length > 0) {
          setStore(stores[0])
        }
      }
      setIsLoading(false)
    })
    .catch(() => setIsLoading(false))

    // Listen for changes on auth state (logged in, signed out, etc.)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session?.user) {
        setUser({
          id: session.user.id,
          email: session.user.email!,
          role: 'admin',
          created_at: session.user.created_at
        })
        const { data: stores } = await supabase
          .from('stores')
          .select('*')
          .eq('owner_id', session.user.id)
          .limit(1)
        if (stores && stores.length > 0) {
          setStore(stores[0])
        }
      } else {
        setUser(null)
        setStore(null)
        navigate('/')
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  return <>{children}</>
}
