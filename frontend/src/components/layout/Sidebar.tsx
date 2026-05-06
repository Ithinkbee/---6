import { NavLink } from 'react-router-dom'
import { useCallback, useState } from 'react'
import { useAuthStore } from '../../stores/authStore'
import { useNotesStore } from '../../stores/notesStore'
import { Home, Search, Calendar, MessageSquare, User, LogOut, Music2, ShoppingBag } from 'lucide-react'

const navItems = [
  { path: '/',           label: 'Главная',   icon: Home },
  { path: '/search',    label: 'Поиск',     icon: Search },
  { path: '/events',    label: 'События',   icon: Calendar },
  { path: '/assistant', label: 'Ассистент', icon: MessageSquare },
  { path: '/quiz',      label: 'Викторина', icon: Music2 },
  { path: '/shop',      label: 'Магазин',   icon: ShoppingBag },
  { path: '/profile',   label: 'Профиль',   icon: User },
]

const ACCENT = '#A855F7'
const ACCENT_BG = 'rgba(168,85,247,0.12)'

// ── Fleeing logout button ─────────────────────────────────────────────────────

function FleeingLogoutButton({ onLogout }: { onLogout: () => void }) {
  const [pos, setPos] = useState<{ x: number; y: number } | null>(null)

  const flee = useCallback((e: React.MouseEvent) => {
    const vw = window.innerWidth
    const vh = window.innerHeight
    const mx = e.clientX
    const my = e.clientY
    const angle = Math.random() * Math.PI * 2
    const dist = 160 + Math.random() * 200
    let nx = mx + Math.cos(angle) * dist
    let ny = my + Math.sin(angle) * dist
    nx = Math.max(10, Math.min(vw - 160, nx))
    ny = Math.max(10, Math.min(vh - 60, ny))
    setPos({ x: nx, y: ny })
  }, [])

  return (
    <button
      onClick={onLogout}
      onMouseEnter={flee}
      className="flex items-center gap-3 w-full px-4 py-2.5 rounded-2xl text-sm font-medium transition-all cursor-pointer"
      style={{
        color: '#FF375F',
        ...(pos
          ? {
              position: 'fixed',
              left: pos.x,
              top: pos.y,
              zIndex: 9999,
              width: 'auto',
              background: '#1C1C1E',
              border: '1px solid rgba(255,55,95,0.2)',
              transition: 'left 0.25s cubic-bezier(.22,1,.36,1), top 0.25s cubic-bezier(.22,1,.36,1)',
            }
          : {}),
      }}
      onMouseLeave={(e) => {
        if (!pos) (e.currentTarget as HTMLElement).style.background = 'transparent'
      }}
    >
      <LogOut className="h-4 w-4 shrink-0" />
      {!pos && <span>Выйти</span>}
      {pos && <span>Выйти</span>}
    </button>
  )
}

// ── Sidebar ───────────────────────────────────────────────────────────────────

export default function Sidebar() {
  const { user, signOut } = useAuthStore()
  const { notes, unlocked } = useNotesStore()

  return (
    <aside
      className="hidden lg:flex lg:flex-col lg:w-64 h-screen sticky top-0"
      style={{ background: '#0A0A0A', borderRight: '1px solid rgba(255,255,255,0.06)' }}
    >
      <div className="p-6 pb-3">
        <h1 className="text-lg font-bold tracking-tight" style={{ color: ACCENT }}>
          Музыкальный ИИ
        </h1>
        <p className="text-sm mt-0.5 truncate" style={{ color: '#8E8E93' }}>
          {user?.display_name || user?.email}
        </p>
        {/* Notes balance */}
        <div
          className="flex items-center gap-1.5 mt-2 px-2.5 py-1 rounded-full w-fit"
          style={{ background: ACCENT_BG }}
        >
          <span className="text-xs" style={{ color: ACCENT }}>♩</span>
          <span className="text-xs font-bold" style={{ color: ACCENT }}>{notes} нот</span>
        </div>
      </div>

      <div style={{ height: 1, background: 'rgba(255,255,255,0.06)', margin: '0 16px' }} />

      <nav className="flex-1 p-3 space-y-0.5 mt-2">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.path === '/'}
            className="block"
          >
            {({ isActive }) => (
              <div
                className="flex items-center gap-3 px-4 py-2.5 rounded-2xl text-sm font-medium transition-all"
                style={
                  isActive
                    ? { background: ACCENT_BG, color: ACCENT }
                    : { color: '#8E8E93' }
                }
                onMouseEnter={(e) => {
                  if (!isActive) (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.04)'
                }}
                onMouseLeave={(e) => {
                  if (!isActive) (e.currentTarget as HTMLElement).style.background = 'transparent'
                }}
              >
                <item.icon className="h-4 w-4" />
                <span>{item.label}</span>
                {item.path === '/quiz' && (
                  <span className="ml-auto text-xs px-1.5 py-0.5 rounded-full" style={{ background: 'rgba(255,214,10,0.12)', color: '#FFD60A' }}>
                    +♩
                  </span>
                )}
                {item.path === '/shop' && !Object.values(unlocked).every(Boolean) && (
                  <span className="ml-auto w-1.5 h-1.5 rounded-full" style={{ background: ACCENT }} />
                )}
              </div>
            )}
          </NavLink>
        ))}
      </nav>

      <div style={{ height: 1, background: 'rgba(255,255,255,0.06)', margin: '0 16px' }} />

      <div className="p-3 mb-2">
        {unlocked.disableFleeingLogout ? (
          <button
            onClick={() => signOut()}
            className="flex items-center gap-3 w-full px-4 py-2.5 rounded-2xl text-sm font-medium transition-all cursor-pointer"
            style={{ color: '#FF375F' }}
            onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(255,55,95,0.08)')}
            onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
          >
            <LogOut className="h-4 w-4" />
            Выйти
          </button>
        ) : (
          <FleeingLogoutButton onLogout={() => signOut()} />
        )}
      </div>
    </aside>
  )
}
