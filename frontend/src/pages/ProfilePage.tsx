import { useState, useEffect, useRef, useCallback } from 'react'
import { Loader2, LogOut, Music, Camera, Lock, ShoppingBag } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useProfile, useUpdateProfile } from '../hooks/useProfile'
import { useAuthStore } from '../stores/authStore'
import { useNotesStore } from '../stores/notesStore'
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

// ── Conveyor belt genres ──────────────────────────────────────────────────────

function CheckPill({
  label, checked, onToggle,
}: { label: string; checked: boolean; onToggle: () => void }) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className="text-sm font-medium px-4 py-2 rounded-full transition-all shrink-0"
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

function ConveyorGenres({
  genres, selectedGenres, onToggle,
}: { genres: typeof GENRES; selectedGenres: string[]; onToggle: (v: string) => void }) {
  const doubled = [...genres, ...genres]
  const [paused, setPaused] = useState(false)

  return (
    <div
      style={{ overflow: 'hidden', position: 'relative', cursor: 'pointer' }}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      title="Наведите, чтобы остановить конвейер"
    >
      {/* style tag for keyframes scoped to this usage */}
      <style>{`@keyframes conveyor-slide { 0%{transform:translateX(0)} 100%{transform:translateX(-50%)} }`}</style>
      <div
        style={{
          display: 'flex',
          gap: '8px',
          width: 'max-content',
          animation: 'conveyor-slide 7s linear infinite',
          animationPlayState: paused ? 'paused' : 'running',
        }}
      >
        {doubled.map((g, i) => (
          <CheckPill
            key={`${g.value}-${i}`}
            label={g.label}
            checked={selectedGenres.includes(g.value)}
            onToggle={() => onToggle(g.value)}
          />
        ))}
      </div>
    </div>
  )
}

// ── Fleeing logout button ─────────────────────────────────────────────────────

function FleeingLogoutButton({ onLogout }: { onLogout: () => void }) {
  const [pos, setPos] = useState<{ x: number; y: number } | null>(null)

  const flee = useCallback((e: React.MouseEvent) => {
    const vw = window.innerWidth
    const vh = window.innerHeight
    const mx = e.clientX
    const my = e.clientY
    const angle = Math.random() * Math.PI * 2
    const dist = 160 + Math.random() * 180
    let nx = mx + Math.cos(angle) * dist
    let ny = my + Math.sin(angle) * dist
    nx = Math.max(10, Math.min(vw - 160, nx))
    ny = Math.max(10, Math.min(vh - 60, ny))
    setPos({ x: nx, y: ny })
  }, [])

  return (
    <button
      type="button"
      onClick={onLogout}
      onMouseEnter={flee}
      className="flex items-center gap-2 px-6 py-3 rounded-full font-bold text-sm transition-all"
      style={{
        background: 'rgba(255,55,95,0.12)',
        color: '#FF375F',
        border: '1px solid rgba(255,55,95,0.2)',
        ...(pos
          ? {
              position: 'fixed',
              left: pos.x,
              top: pos.y,
              zIndex: 9999,
              transition: 'left 0.25s cubic-bezier(.22,1,.36,1), top 0.25s cubic-bezier(.22,1,.36,1)',
            }
          : {}),
      }}
    >
      <LogOut className="h-4 w-4" />
      Выйти
    </button>
  )
}

// ── Avatar component ──────────────────────────────────────────────────────────

function Avatar({
  displayName, unlocked,
}: { displayName: string | null; unlocked: boolean }) {
  const fileRef = useRef<HTMLInputElement>(null)
  const { avatarDataUrl, setAvatar } = useNotesStore()

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => setAvatar(ev.target?.result as string)
    reader.readAsDataURL(file)
  }

  return (
    <div className="relative w-12 h-12">
      {avatarDataUrl ? (
        <img
          src={avatarDataUrl}
          alt="avatar"
          className="w-12 h-12 rounded-2xl object-cover"
        />
      ) : (
        <div
          className="flex items-center justify-center w-12 h-12 rounded-2xl"
          style={{ background: ACCENT_BG }}
        >
          <Music className="h-6 w-6" style={{ color: ACCENT }} />
        </div>
      )}

      {unlocked ? (
        <>
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            className="absolute -bottom-1 -right-1 flex items-center justify-center w-5 h-5 rounded-full"
            style={{ background: ACCENT, cursor: 'pointer' }}
            title="Загрузить фото"
          >
            <Camera className="h-3 w-3 text-black" />
          </button>
          <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFile} />
        </>
      ) : (
        <div
          className="absolute -bottom-1 -right-1 flex items-center justify-center w-5 h-5 rounded-full"
          style={{ background: '#2C2C2E', border: '1px solid rgba(255,255,255,0.1)' }}
          title="Купите в магазине"
        >
          <Lock className="h-3 w-3" style={{ color: '#8E8E93' }} />
        </div>
      )}
    </div>
  )
}

// ── Main page ─────────────────────────────────────────────────────────────────

export default function ProfilePage() {
  const { data: profile, isLoading } = useProfile()
  const updateProfile = useUpdateProfile()
  const { user, signOut } = useAuthStore()
  const { unlocked } = useNotesStore()

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
          <Avatar displayName={user?.display_name ?? null} unlocked={unlocked.profilePicture} />
          <div className="flex-1 min-w-0">
            <p className="text-base font-bold text-white">{user?.display_name || 'Пользователь'}</p>
            <p className="text-sm" style={{ color: '#8E8E93' }}>{user?.email}</p>
          </div>
          {!unlocked.profilePicture && (
            <Link
              to="/shop"
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-medium shrink-0"
              style={{ background: ACCENT_BG, color: ACCENT }}
              title="Разблокировать смену аватара"
            >
              <ShoppingBag className="h-3 w-3" />
              Аватар
            </Link>
          )}
        </div>
      </div>

      {/* Music preferences */}
      <div className="rounded-3xl p-5 space-y-4" style={{ background: '#1C1C1E' }}>
        <h2 className="font-bold text-white">Музыкальные предпочтения</h2>

        <div>
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs font-semibold" style={{ color: '#8E8E93' }}>Любимые жанры</p>
            {!unlocked.disableGenreConveyor && (
              <span className="text-xs" style={{ color: '#636366' }}>🎠 конвейер</span>
            )}
          </div>

          {unlocked.disableGenreConveyor ? (
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
          ) : (
            <ConveyorGenres
              genres={GENRES}
              selectedGenres={genres}
              onToggle={toggleGenre}
            />
          )}
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

        {unlocked.disableFleeingLogout ? (
          <button
            type="button"
            onClick={() => signOut()}
            className="flex items-center gap-2 px-6 py-3 rounded-full font-bold text-sm transition-all"
            style={{ background: 'rgba(255,55,95,0.12)', color: '#FF375F', border: '1px solid rgba(255,55,95,0.2)' }}
          >
            <LogOut className="h-4 w-4" />
            Выйти
          </button>
        ) : (
          <FleeingLogoutButton onLogout={() => signOut()} />
        )}
      </div>
    </div>
  )
}
