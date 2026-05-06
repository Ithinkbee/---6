import { useState, useRef, useCallback } from 'react'
import { Search, Music, Disc, ChevronDown, ChevronUp, ShoppingBag } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useSearchArtists, useArtistDetail, type Artist } from '../hooks/useMusic'
import { useNotesStore } from '../stores/notesStore'

const ACCENT = '#A855F7'
const ACCENT_BG = 'rgba(168,85,247,0.12)'

const GENRES = [
  { value: '', label: 'Все жанры' },
  { value: 'rock', label: 'Рок' },
  { value: 'pop', label: 'Поп' },
  { value: 'jazz', label: 'Джаз' },
  { value: 'classical', label: 'Классика' },
  { value: 'hip_hop', label: 'Хип-хоп' },
  { value: 'electronic', label: 'Электронная' },
  { value: 'folk', label: 'Фолк' },
  { value: 'rnb', label: 'R&B' },
  { value: 'metal', label: 'Метал' },
  { value: 'indie', label: 'Инди' },
]

// ── Sound generators ─────────────────────────────────────────────────────────

function playSeagull(ctx: AudioContext) {
  for (let i = 0; i < 3; i++) {
    const t = ctx.currentTime + i * 0.55
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.connect(gain)
    gain.connect(ctx.destination)
    osc.type = 'sawtooth'
    osc.frequency.setValueAtTime(900, t)
    osc.frequency.linearRampToValueAtTime(1600, t + 0.2)
    osc.frequency.linearRampToValueAtTime(900, t + 0.42)
    gain.gain.setValueAtTime(0, t)
    gain.gain.linearRampToValueAtTime(0.25, t + 0.04)
    gain.gain.setValueAtTime(0.25, t + 0.38)
    gain.gain.linearRampToValueAtTime(0, t + 0.42)
    osc.start(t)
    osc.stop(t + 0.42)
  }
}

function playDrill(ctx: AudioContext) {
  const osc = ctx.createOscillator()
  const lfo = ctx.createOscillator()
  const lfoGain = ctx.createGain()
  const master = ctx.createGain()
  osc.connect(master)
  lfo.connect(lfoGain)
  lfoGain.connect(master.gain)
  master.connect(ctx.destination)
  osc.type = 'sawtooth'
  osc.frequency.value = 80
  lfo.type = 'square'
  lfo.frequency.value = 55
  lfoGain.gain.value = 0.3
  master.gain.value = 0.3
  osc.start(ctx.currentTime)
  lfo.start(ctx.currentTime)
  osc.stop(ctx.currentTime + 1.6)
  lfo.stop(ctx.currentTime + 1.6)
}

// ── Artist card (same as before) ─────────────────────────────────────────────

function ArtistCard({ artist }: { artist: Artist }) {
  const [expanded, setExpanded] = useState(false)
  const { data: detail } = useArtistDetail(expanded ? artist.id : null)

  return (
    <div className="rounded-2xl overflow-hidden" style={{ background: '#1C1C1E' }}>
      <button
        type="button"
        className="flex items-center gap-3 w-full p-4 text-left"
        onClick={() => setExpanded((v) => !v)}
      >
        <div className="flex items-center justify-center w-10 h-10 rounded-xl shrink-0" style={{ background: ACCENT_BG }}>
          <Music className="h-5 w-5" style={{ color: ACCENT }} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-white">{artist.name}</p>
          <p className="text-xs capitalize" style={{ color: '#8E8E93' }}>
            {artist.genre} · {artist.country}
          </p>
        </div>
        {expanded
          ? <ChevronUp className="h-4 w-4 shrink-0" style={{ color: '#8E8E93' }} />
          : <ChevronDown className="h-4 w-4 shrink-0" style={{ color: '#8E8E93' }} />}
      </button>

      {expanded && (
        <div className="px-4 pb-4 space-y-3" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
          {artist.bio && (
            <p className="text-xs pt-3" style={{ color: '#8E8E93' }}>{artist.bio}</p>
          )}
          {detail ? (
            detail.albums.length > 0 ? (
              <div className="space-y-2">
                {detail.albums.map((alb) => (
                  <div key={alb.id} className="rounded-xl p-3" style={{ background: '#2C2C2E' }}>
                    <div className="flex items-center gap-2 mb-1">
                      <Disc className="h-3.5 w-3.5" style={{ color: ACCENT }} />
                      <span className="text-xs font-semibold text-white">{alb.title}</span>
                      <span className="text-xs" style={{ color: '#8E8E93' }}>{alb.year}</span>
                    </div>
                    <ul className="space-y-0.5 pl-5">
                      {alb.tracks.map((t) => (
                        <li key={t.id} className="text-xs" style={{ color: '#636366' }}>
                          {t.track_number ? `${t.track_number}. ` : ''}{t.title}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs" style={{ color: '#636366' }}>Альбомы не найдены.</p>
            )
          ) : (
            <p className="text-xs" style={{ color: '#636366' }}>Загрузка альбомов…</p>
          )}
        </div>
      )}
    </div>
  )
}

// ── Minesweeper tile types ────────────────────────────────────────────────────

type TileContent =
  | { type: 'artist'; artist: Artist }
  | { type: 'bomb'; sound: 'seagull' | 'drill' }

interface Tile {
  id: string
  content: TileContent
  revealed: boolean
  shaking: boolean
}

function buildTiles(artists: Artist[]): Tile[] {
  const bombCount = Math.max(3, Math.ceil(artists.length * 0.7))
  const artistTiles: Tile[] = artists.map((a, i) => ({
    id: `a-${i}`,
    content: { type: 'artist', artist: a },
    revealed: false,
    shaking: false,
  }))
  const bombTiles: Tile[] = Array.from({ length: bombCount }, (_, i) => ({
    id: `b-${i}`,
    content: { type: 'bomb', sound: (Math.random() < 0.5 ? 'seagull' : 'drill') as 'seagull' | 'drill' },
    revealed: false,
    shaking: false,
  }))
  return [...artistTiles, ...bombTiles].sort(() => Math.random() - 0.5)
}

function MinesweeperGrid({ artists }: { artists: Artist[] }) {
  const [tiles, setTiles] = useState<Tile[]>(() => buildTiles(artists))
  const ctxRef = useRef<AudioContext | null>(null)

  const revealTile = useCallback((id: string) => {
    setTiles((prev) =>
      prev.map((t) => {
        if (t.id !== id || t.revealed) return t

        if (t.content.type === 'bomb') {
          if (!ctxRef.current || ctxRef.current.state === 'closed') {
            ctxRef.current = new AudioContext()
          }
          if (t.content.sound === 'seagull') playSeagull(ctxRef.current)
          else playDrill(ctxRef.current)

          // shake then stop shaking
          setTimeout(() => {
            setTiles((p) => p.map((x) => x.id === id ? { ...x, shaking: false } : x))
          }, 600)
          return { ...t, revealed: true, shaking: true }
        }

        return { ...t, revealed: true }
      })
    )
  }, [])

  const unrevealed = tiles.filter((t) => !t.revealed).length
  const found = tiles.filter((t) => t.revealed && t.content.type === 'artist').length

  return (
    <div className="space-y-3">
      {/* Banner */}
      <div
        className="flex items-center justify-between p-3 rounded-2xl text-sm"
        style={{ background: '#1C1C1E', border: '1px solid rgba(255,165,0,0.2)' }}
      >
        <div>
          <span className="font-bold text-white">Режим «Угадай, чё выкину» 💣</span>
          <span className="ml-2 text-xs" style={{ color: '#8E8E93' }}>
            Под плитками скрыты результаты… или кое-что похуже
          </span>
        </div>
        <Link
          to="/shop"
          className="flex items-center gap-1 px-2 py-1 rounded-xl text-xs shrink-0"
          style={{ background: ACCENT_BG, color: ACCENT }}
        >
          <ShoppingBag className="h-3 w-3" />
          Отключить
        </Link>
      </div>

      <p className="text-xs" style={{ color: '#8E8E93' }}>
        Нажмите на плитку, чтобы открыть · Найдено: {found} · Осталось: {unrevealed}
      </p>

      <div className="grid grid-cols-3 gap-2">
        {tiles.map((tile) => {
          if (!tile.revealed) {
            return (
              <button
                key={tile.id}
                type="button"
                onClick={() => revealTile(tile.id)}
                className="aspect-square rounded-2xl flex items-center justify-center text-2xl font-bold transition-all"
                style={{
                  background: 'rgba(168,85,247,0.1)',
                  border: '1px solid rgba(168,85,247,0.25)',
                  color: ACCENT,
                  cursor: 'pointer',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(168,85,247,0.2)')}
                onMouseLeave={(e) => (e.currentTarget.style.background = 'rgba(168,85,247,0.1)')}
              >
                ♩
              </button>
            )
          }

          if (tile.content.type === 'bomb') {
            return (
              <div
                key={tile.id}
                className="aspect-square rounded-2xl flex flex-col items-center justify-center gap-1"
                style={{
                  background: 'rgba(255,55,95,0.1)',
                  border: '1px solid rgba(255,55,95,0.3)',
                  animation: tile.shaking ? 'tile-shake 0.6s ease' : 'none',
                }}
              >
                <span className="text-2xl">{tile.content.sound === 'seagull' ? '🐦' : '🔩'}</span>
                <span className="text-xs font-bold" style={{ color: '#FF375F' }}>
                  {tile.content.sound === 'seagull' ? 'Чайки!' : 'Дрель!'}
                </span>
              </div>
            )
          }

          // Artist tile — revealed
          return (
            <div
              key={tile.id}
              className="aspect-square rounded-2xl p-2 flex flex-col items-center justify-center gap-1 text-center overflow-hidden"
              style={{ background: '#1C1C1E', border: '1px solid rgba(52,199,89,0.2)' }}
            >
              <Music className="h-5 w-5 shrink-0" style={{ color: ACCENT }} />
              <p className="text-xs font-semibold text-white leading-tight line-clamp-2">
                {tile.content.artist.name}
              </p>
              <p className="text-[10px] capitalize" style={{ color: '#8E8E93' }}>
                {tile.content.artist.genre}
              </p>
            </div>
          )
        })}
      </div>

      {/* Show full list below after some revealed */}
      {found > 0 && (
        <div className="space-y-2 pt-2">
          <p className="text-xs font-semibold" style={{ color: '#8E8E93' }}>Открытые исполнители:</p>
          {tiles
            .filter((t) => t.revealed && t.content.type === 'artist')
            .map((t) => (
              <ArtistCard key={t.id} artist={(t.content as { type: 'artist'; artist: Artist }).artist} />
            ))}
        </div>
      )}
    </div>
  )
}

// ── Main page ─────────────────────────────────────────────────────────────────

export default function SearchPage() {
  const [query, setQuery] = useState('')
  const [genre, setGenre] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [searchKey, setSearchKey] = useState(0)

  const minesweeperDisabled = useNotesStore((s) => s.unlocked.disableMinesweeperSearch)

  const { data: artists, isLoading } = useSearchArtists(
    submitted ? query : '',
    submitted ? genre : '',
  )

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setSearchKey((k) => k + 1)
    setSubmitted(true)
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Поиск музыки</h1>
        <p className="text-sm mt-1" style={{ color: '#8E8E93' }}>Найдите исполнителя, альбом или трек</p>
      </div>

      <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4" style={{ color: '#8E8E93' }} />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Введите имя исполнителя…"
            className="w-full pl-9 pr-4 py-2.5 rounded-2xl text-sm text-white placeholder-[#636366] outline-none"
            style={{ background: '#1C1C1E', border: '1px solid rgba(255,255,255,0.06)' }}
            onFocus={(e) => (e.target.style.borderColor = 'rgba(168,85,247,0.4)')}
            onBlur={(e) => (e.target.style.borderColor = 'rgba(255,255,255,0.06)')}
          />
        </div>
        <select
          value={genre}
          onChange={(e) => setGenre(e.target.value)}
          className="px-4 py-2.5 rounded-2xl text-sm text-white outline-none"
          style={{ background: '#1C1C1E', border: '1px solid rgba(255,255,255,0.06)' }}
        >
          {GENRES.map((g) => (
            <option key={g.value} value={g.value}>{g.label}</option>
          ))}
        </select>
        <button
          type="submit"
          className="px-5 py-2.5 rounded-2xl text-sm font-semibold transition-all"
          style={{ background: ACCENT_BG, color: ACCENT, border: `1px solid rgba(168,85,247,0.3)` }}
        >
          Найти
        </button>
      </form>

      {submitted && (
        <div className="space-y-2">
          {isLoading ? (
            <p className="text-sm" style={{ color: '#8E8E93' }}>Поиск…</p>
          ) : !artists || artists.length === 0 ? (
            <p className="text-sm" style={{ color: '#8E8E93' }}>Ничего не найдено. Попробуйте другой запрос.</p>
          ) : minesweeperDisabled ? (
            <>
              <p className="text-xs" style={{ color: '#8E8E93' }}>Найдено: {artists.length}</p>
              {artists.map((a) => <ArtistCard key={a.id} artist={a} />)}
            </>
          ) : (
            <MinesweeperGrid key={searchKey} artists={artists} />
          )}
        </div>
      )}
    </div>
  )
}
