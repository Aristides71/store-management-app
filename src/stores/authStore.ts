import { create } from 'zustand'
import { User, Store } from '../types'

interface AuthState {
  user: User | null
  store: Store | null
  isAuthenticated: boolean
  isLoading: boolean
  setUser: (user: User | null) => void
  setStore: (store: Store | null) => void
  setIsLoading: (loading: boolean) => void
  logout: () => void
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  store: null,
  isAuthenticated: false,
  isLoading: true,
  setUser: (user) => set({ user, isAuthenticated: !!user }),
  setStore: (store) => set({ store }),
  setIsLoading: (loading) => set({ isLoading: loading }),
  logout: () => set({ user: null, store: null, isAuthenticated: false }),
}))