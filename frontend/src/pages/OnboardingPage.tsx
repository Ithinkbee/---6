import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Loader2 } from 'lucide-react'
import { useCreateProfile } from '../hooks/useProfile'

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

const ACCENT = '#A855F7'
const ACCENT_BG = 'rgba(168,85,247,0.12)'

function CheckPill({
  label,
  checked,
  onToggle,
}: {
  label: string
  checked: boolean
  onToggle: () => void
}) {
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
      {label}
    </button>
  )
}

export default function OnboardingPage() {
  const navigate = useNavigate()
  const createProfile = useCreateProfile()

  const [genres, setGenres] = useState<string[]>([])
  const [artistsInput, setArtistsInput] = useState('')

  const toggleGenre = (value: string) => {
    setGenres((prev) =>
      prev.includes(value) ? prev.filter((g) => g !== value) : [...prev, value]
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const favorite_artists = artistsInput
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean)
    await createProfile.mutateAsync({ favorite_genres: genres, favorite_artists })
    navigate('/')
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4"
      style={{ background: '#000' }}
    >
      <div className="w-full max-w-md space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Добро пожаловать!</h1>
          <p className="text-sm mt-1" style={{ color: '#8E8E93' }}>
            Расскажи о своих музыкальных предпочтениях
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Genres */}
          <div>
            <label className="block text-sm font-semibold text-white mb-3">
              Любимые жанры
            </label>
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

          {/* Favorite artists */}
          <div>
            <label className="block text-sm font-semibold text-white mb-1.5">
              Любимые исполнители{' '}
              <span className="font-normal" style={{ color: '#636366' }}>
                (через запятую)
              </span>
            </label>
            <input
              type="text"
              value={artistsInput}
              onChange={(e) => setArtistsInput(e.target.value)}
              placeholder="Кино, Земфира, The Beatles…"
              className="w-full px-4 py-3 rounded-2xl text-sm text-white placeholder-[#636366] outline-none"
              style={{ background: '#1C1C1E', border: '1px solid rgba(255,255,255,0.06)' }}
              onFocus={(e) => (e.target.style.borderColor = 'rgba(168,85,247,0.4)')}
              onBlur={(e) => (e.target.style.borderColor = 'rgba(255,255,255,0.06)')}
            />
          </div>

          <button
            type="submit"
            disabled={createProfile.isPending}
            className="w-full py-3 rounded-2xl text-sm font-semibold flex items-center justify-center gap-2 transition-all"
            style={{ background: ACCENT_BG, color: ACCENT, border: `1px solid rgba(168,85,247,0.3)` }}
          >
            {createProfile.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
            Начать
          </button>
        </form>
      </div>
    </div>
  )
}
