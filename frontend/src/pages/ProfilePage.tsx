import { useState, useEffect } from 'react'
import { Loader2, LogOut, Music } from 'lucide-react'
import { useProfile, useUpdateProfile } from '../hooks/useProfile'
import { useAuthStore } from '../stores/authStore'
import LoadingSpinner from '../components/common/LoadingSpinner'

const ACCENT = '#A855F7'
const ACCENT_BG = 'rgba(168,85,247,0.12)'

const GENRES: { value: string; label: string }[] = [
  { value: 'rock',       label: 'Рок' },
  { value: 'pop',        label: 'Поп' },
  { value: 'jazz',       label: 'Джаз' },
  { value: 'classical',  label: 'Классика' },
  { value: 'hip_hop',    label: 'Хип-хоп' },
  { value: 'electronic', label: 'Электронная' },
  { value: 'folk',       label: 'Фолк' },
  { value: 'rnb',        label: 'R&B' },
  { value: 'metal',      label: 'Метал' },
  { value: 'indie',      label: 'Инди' },
]

function CheckPill({ label, checked, onToggle }: { label: string; checked: boolean; onToggle: () => void }) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className="text-sm font-medium px-4 py-2 rounded-full transition-all"
      style={
        checked
          ? { background: 'rgba(168,85,247,0.15)', color: ACCENT, border: '1px solid rgba(168,85,247,0.35)' }
          : { background: '#2C2C2E', color: '#8E8E93', border: '1px solid rgba(255,255,255,0.06)' }
      }
    >
      {checked ? '✓ ' : ''}{label}
    </button>
  )
}

export default function ProfilePage() {
  const { data: profile, isLoading } = useProfile()
  const updateProfile = useUpdateProfile()
  const { user, signOut } = useAuthStore()

  const [genres, setGenres] = useState<string[]>([])
  const [artistsInput, setArtistsInput] = useState('')

  useEffect(() => {
    if (profile) {
      setGenres(profile.favorite_genres)
      setArtistsInput(profile.favorite_artists.join(', '))
    }
  }, [profile])

  const toggleGenre = (value: string) => {
    setGenres((prev) =>
      prev.includes(value) ? prev.filter((g) => g !== value) : [...prev, value]
    )
  }

  const handleSave = async () => {
    const favorite_artists = artistsInput
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean)
    await updateProfile.mutateAsync({ favorite_genres: genres, favorite_artists })
  }

  if (isLoading) return <LoadingSpinner />

  return (
    <div className="space-y-5 max-w-xl">
      <h1 className="text-2xl font-bold text-white">Профиль</h1>

      {/* User card */}
      <div className="rounded-3xl p-5" style={{ background: '#1C1C1E' }}>
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-12 h-12 rounded-2xl" style={{ background: ACCENT_BG }}>
            <Music className="h-6 w-6" style={{ color: ACCENT }} />
          </div>
          <div>
            <p className="text-base font-bold text-white">{user?.display_name || 'Пользователь'}</p>
            <p className="text-sm" style={{ color: '#8E8E93' }}>{user?.email}</p>
          </div>
        </div>
      </div>

      {/* Music preferences */}
      <div className="rounded-3xl p-5 space-y-4" style={{ background: '#1C1C1E' }}>
        <h2 className="font-bold text-white">Музыкальные предпочтения</h2>

        <div>
          <p className="text-xs font-semibold mb-2" style={{ color: '#8E8E93' }}>Любимые жанры</p>
          <div className="flex flex-wrap gap-2">
            {GENRES.map((g) => (
              <CheckPill
                key={g.value}
                label={g.label}
                checked={genres.includes(g.value)}
                onToggle={() => toggleGenre(g.value)}
              />
            ))}
          </div>
        </div>

        <div>
          <p className="text-xs font-semibold mb-1.5" style={{ color: '#8E8E93' }}>
            Любимые исполнители{' '}
            <span className="font-normal" style={{ color: '#636366' }}>(через запятую)</span>
          </p>
          <input
            type="text"
            value={artistsInput}
            onChange={(e) => setArtistsInput(e.target.value)}
            placeholder="Кино, Земфира, The Beatles…"
            className="w-full px-4 py-3 rounded-2xl text-sm text-white placeholder-[#636366] outline-none"
            style={{ background: '#2C2C2E', border: '1px solid rgba(255,255,255,0.06)' }}
            onFocus={(e) => (e.target.style.borderColor = 'rgba(168,85,247,0.4)')}
            onBlur={(e) => (e.target.style.borderColor = 'rgba(255,255,255,0.06)')}
          />
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-3">
        <button
          type="button"
          onClick={handleSave}
          disabled={updateProfile.isPending}
          className="flex items-center gap-2 px-6 py-3 rounded-full font-bold text-sm transition-all"
          style={{ background: ACCENT_BG, color: ACCENT, border: `1px solid rgba(168,85,247,0.3)` }}
        >
          {updateProfile.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
          Сохранить
        </button>
        <button
          type="button"
          onClick={() => signOut()}
          className="flex items-center gap-2 px-6 py-3 rounded-full font-bold text-sm transition-all"
          style={{ background: 'rgba(255,55,95,0.12)', color: '#FF375F', border: '1px solid rgba(255,55,95,0.2)' }}
        >
          <LogOut className="h-4 w-4" />
          Выйти
        </button>
      </div>
    </div>
  )
}
