import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import api from '../config/api'

export interface UserProfile {
  id: number
  user_id: number
  favorite_genres: string[]
  favorite_artists: string[]
  updated_at: string
}

export interface ProfileInput {
  favorite_genres: string[]
  favorite_artists: string[]
}

export function useProfile() {
  return useQuery<UserProfile>({
    queryKey: ['profile'],
    queryFn: async () => {
      const { data } = await api.get('/users/me/profile')
      return data
    },
  })
}

export function useCreateProfile() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (profile: ProfileInput) => {
      const { data } = await api.post('/users/me/profile', profile)
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile'] })
      queryClient.invalidateQueries({ queryKey: ['user'] })
    },
  })
}

export function useUpdateProfile() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (profile: Partial<ProfileInput>) => {
      const { data } = await api.patch('/users/me/profile', profile)
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile'] })
    },
  })
}
