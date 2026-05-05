import { useState } from 'react'
import { Search, Music, Disc, ChevronDown, ChevronUp } from 'lucide-react'
import { useSearchArtists, useArtistDetail, type Artist } from '../hooks/useMusic'

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
        {expanded ? (
          <ChevronUp className="h-4 w-4 shrink-0" style={{ color: '#8E8E93' }} />
        ) : (
          <ChevronDown className="h-4 w-4 shrink-0" style={{ color: '#8E8E93' }} />
        )}
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

export default function SearchPage() {
  const [query, setQuery] = useState('')
  const [genre, setGenre] = useState('')
  const [submitted, setSubmitted] = useState(false)

  const { data: artists, isLoading } = useSearchArtists(
    submitted ? query : '',
    submitted ? genre : '',
  )

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
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
          ) : (
            <>
              <p className="text-xs" style={{ color: '#8E8E93' }}>Найдено: {artists.length}</p>
              {artists.map((a) => <ArtistCard key={a.id} artist={a} />)}
            </>
          )}
        </div>
      )}
    </div>
  )
}
