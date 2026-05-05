import { useState } from 'react'
import { Calendar, MapPin } from 'lucide-react'
import { useEvents } from '../hooks/useMusic'

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

const GENRE_LABELS: Record<string, string> = {
  rock: 'Рок', pop: 'Поп', jazz: 'Джаз', classical: 'Классика',
  hip_hop: 'Хип-хоп', electronic: 'Электронная', folk: 'Фолк',
  rnb: 'R&B', metal: 'Метал', indie: 'Инди',
}

export default function EventsPage() {
  const [city, setCity] = useState('')
  const [genre, setGenre] = useState('')

  const { data: events, isLoading } = useEvents(city, genre)

  const formatDate = (iso: string) => {
    const d = new Date(iso)
    return d.toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' })
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Музыкальные события</h1>
        <p className="text-sm mt-1" style={{ color: '#8E8E93' }}>Концерты и фестивали</p>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-2">
        <input
          type="text"
          value={city}
          onChange={(e) => setCity(e.target.value)}
          placeholder="Город…"
          className="flex-1 px-4 py-2.5 rounded-2xl text-sm text-white placeholder-[#636366] outline-none"
          style={{ background: '#1C1C1E', border: '1px solid rgba(255,255,255,0.06)' }}
          onFocus={(e) => (e.target.style.borderColor = 'rgba(168,85,247,0.4)')}
          onBlur={(e) => (e.target.style.borderColor = 'rgba(255,255,255,0.06)')}
        />
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
      </div>

      {/* Events list */}
      {isLoading ? (
        <p className="text-sm" style={{ color: '#8E8E93' }}>Загрузка…</p>
      ) : !events || events.length === 0 ? (
        <p className="text-sm" style={{ color: '#8E8E93' }}>Мероприятия не найдены.</p>
      ) : (
        <div className="space-y-3">
          {events.map((ev) => (
            <div key={ev.id} className="p-4 rounded-2xl" style={{ background: '#1C1C1E' }}>
              <div className="flex items-start gap-3">
                <div className="flex items-center justify-center w-10 h-10 rounded-xl shrink-0" style={{ background: ACCENT_BG }}>
                  <Calendar className="h-5 w-5" style={{ color: ACCENT }} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="text-sm font-semibold text-white">{ev.title}</p>
                    {ev.genre && (
                      <span
                        className="text-[10px] font-semibold px-2 py-0.5 rounded-full"
                        style={{ background: ACCENT_BG, color: ACCENT }}
                      >
                        {GENRE_LABELS[ev.genre] ?? ev.genre}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-3 mt-1 flex-wrap">
                    <span className="flex items-center gap-1 text-xs" style={{ color: '#8E8E93' }}>
                      <Calendar className="h-3 w-3" />
                      {formatDate(ev.date)}
                    </span>
                    <span className="flex items-center gap-1 text-xs" style={{ color: '#8E8E93' }}>
                      <MapPin className="h-3 w-3" />
                      {ev.city}{ev.venue ? ` · ${ev.venue}` : ''}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
