import { useQuery } from '@tanstack/react-query'
import api from '../config/api'

export interface Artist {
  id: number
  name: string
  genre: string
  country: string
  bio: string | null
}

export interface TrackRead {
  id: number
  title: string
  duration_seconds: number | null
  track_number: number | null
}

export interface AlbumRead {
  id: number
  title: string
  year: number
  genre: string | null
  tracks: TrackRead[]
}

export interface ArtistDetail extends Artist {
  albums: AlbumRead[]
}

export interface MusicEvent {
  id: number
  title: string
  city: string
  date: string
  genre: string | null
  venue: string | null
}

export function useSearchArtists(name: string, genre: string) {
  return useQuery<Artist[]>({
    queryKey: ['artists', name, genre],
    queryFn: async () => {
      const { data } = await api.get('/music/artists', { params: { name, genre } })
      return data
    },
    enabled: name.length > 0 || genre.length > 0,
  })
}

export function useArtistDetail(id: number | null) {
  return useQuery<ArtistDetail>({
    queryKey: ['artist', id],
    queryFn: async () => {
      const { data } = await api.get(`/music/artists/${id}`)
      return data
    },
    enabled: id !== null,
  })
}

export function useEvents(city: string, genre: string) {
  return useQuery<MusicEvent[]>({
    queryKey: ['events', city, genre],
    queryFn: async () => {
      const { data } = await api.get('/music/events', { params: { city, genre } })
      return data
    },
  })
}

export function useRecommendations(genre: string, mood: string) {
  return useQuery<Artist[]>({
    queryKey: ['recommend', genre, mood],
    queryFn: async () => {
      const { data } = await api.get('/music/recommend', { params: { genre, mood } })
      return data
    },
  })
}
