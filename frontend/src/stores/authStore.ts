import { create } from 'zustand'
import { signOut as firebaseSignOut, deleteUser } from 'firebase/auth'
import { auth } from '../config/firebase'
import { useNotesStore } from './notesStore'

interface User {
  id: number
  firebase_uid: string
  email: string
  display_name: string | null
  has_profile: boolean
}

interface AuthState {
  user: User | null
  token: string | null
  isLoading: boolean
  isGuest: boolean
  setUser: (user: User | null) => void
  setToken: (token: string | null) => void
  setLoading: (loading: boolean) => void
  setSession: (user: User | null, token: string | null, isGuest: boolean) => void
  signOut: () => Promise<void>
}

export const useAuthStore = create<AuthState>()((set, get) => ({
  user: null,
  token: null,
  isLoading: true,
  isGuest: false,
  setUser: (user) => set({ user }),
  setToken: (token) => set({ token }),
  setLoading: (isLoading) => set({ isLoading }),
  setSession: (user, token, isGuest) => set({ user, token, isGuest }),
  signOut: async () => {
    const { isGuest, token } = get()
    if (isGuest) {
      if (token) {
        try {
          await fetch(
            `${import.meta.env.VITE_API_URL ?? 'http://localhost:8000/api'}/users/me`,
            { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } },
          )
        } catch {}
      }
      const guestUid = auth.currentUser?.uid
      if (auth.currentUser) {
        try { await deleteUser(auth.currentUser) } catch {}
      }
      if (guestUid) {
        useNotesStore.getState().deleteGuestData(guestUid)
      }
    } else {
      await firebaseSignOut(auth)
    }
    set({ user: null, token: null, isGuest: false })
  },
}))
