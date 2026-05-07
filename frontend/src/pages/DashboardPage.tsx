import { useNavigate } from 'react-router-dom'
import { Search, Calendar, MessageSquare, Music } from 'lucide-react'
import { useRecommendations } from '../hooks/useMusic'
import { useAuthStore } from '../stores/authStore'
import { useProfile } from '../hooks/useProfile'

const ACCENT = '#A855F7'
const ACCENT_BG = 'rgba(168,85,247,0.12)'

function QuickCard({
  icon: Icon,
  label,
  desc,
  path,
}: {
  icon: React.ElementType
  label: string
  desc: string
  path: string
}) {
  const navigate = useNavigate()
  return (
    <button
      type="button"
      onClick={() => navigate(path)}
      className="flex flex-col gap-2 p-5 rounded-3xl text-left transition-all w-full"
      style={{ background: '#1C1C1E', border: '1px solid rgba(255,255,255,0.06)' }}
      onMouseEnter={(e) => (e.currentTarget.style.borderColor = 'rgba(168,85,247,0.3)')}
      onMouseLeave={(e) => (e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)')}
    >
      <div className="flex items-center justify-center w-10 h-10 rounded-2xl" style={{ background: ACCENT_BG }}>
        <Icon className="h-5 w-5" style={{ color: ACCENT }} />
      </div>
      <p className="text-sm font-semibold text-white">{label}</p>
      <p className="text-xs" style={{ color: '#8E8E93' }}>{desc}</p>
    </button>
  )
}

export default function DashboardPage() {
  const { user } = useAuthStore()
  const { data: profile } = useProfile()
  const genre = profile?.favorite_genres?.[0] ?? ''
  const { data: recommended, isLoading } = useRecommendations(genre, '')

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      {/* Greeting */}
      <div>
        <h1 className="text-2xl font-bold text-white">
          Привет{user?.display_name ? `, ${user.display_name}` : ''}!
        </h1>
        <p className="text-sm mt-1" style={{ color: '#8E8E93' }}>
          Что хочешь узнать о музыке сегодня?
        </p>
      </div>

      {/* Quick actions */}
      <div>
        <h2 className="text-base font-semibold text-white mb-3">Быстрый доступ</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <QuickCard icon={Search}      label="Поиск"      desc="Найти исполнителя или трек"         path="/search" />
          <QuickCard icon={Calendar}    label="События"    desc="Концерты и фестивали"               path="/events" />
          <QuickCard icon={MessageSquare} label="Ассистент" desc="Диалог с музыкальным ИИ"          path="/assistant" />
        </div>
      </div>

      {/* Recommended artists */}
      <div>
        <h2 className="text-base font-semibold text-white mb-3">Рекомендуем послушать</h2>
        {isLoading ? (
          <p className="text-sm" style={{ color: '#8E8E93' }}>Загрузка…</p>
        ) : !recommended || recommended.length === 0 ? (
          <p className="text-sm" style={{ color: '#8E8E93' }}>Нет данных. Запустите seed для заполнения базы.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {recommended.slice(0, 6).map((artist) => (
              <div
                key={artist.id}
                className="flex items-start gap-3 p-4 rounded-2xl"
                style={{ background: '#1C1C1E' }}
              >
                <div className="flex items-center justify-center w-10 h-10 rounded-xl shrink-0" style={{ background: ACCENT_BG }}>
                  <Music className="h-5 w-5" style={{ color: ACCENT }} />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-white truncate">{artist.name}</p>
                  <p className="text-xs capitalize" style={{ color: '#8E8E93' }}>
                    {artist.genre} · {artist.country}
                  </p>
                  {artist.bio && (
                    <p className="text-xs mt-1 line-clamp-2" style={{ color: '#636366' }}>
                      {artist.bio}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
