import { useEffect } from 'react'
import { onAuthStateChanged } from 'firebase/auth'
import { auth } from '../config/firebase'
import { useAuthStore } from '../stores/authStore'
import { useNotesStore } from '../stores/notesStore'
import api from '../config/api'

export function useAuth() {
  const { user, token, isLoading, setSession, setLoading } = useAuthStore()

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          const idToken = await firebaseUser.getIdToken()
          const { data } = await api.post('/auth/verify-token', { token: idToken })
          useNotesStore.getState().switchUser(data.firebase_uid, firebaseUser.isAnonymous)
          setSession(data, idToken, firebaseUser.isAnonymous)
        } catch {
          setSession(null, null, false)
        }
      } else {
        setSession(null, null, false)
      }
      setLoading(false)
    })

    return unsubscribe
  }, [setSession, setLoading])

  return { user, token, isLoading }
}
