import { NavLink } from 'react-router-dom'
import { useAuthStore } from '../../stores/authStore'
import { Home, Search, Calendar, MessageSquare, User, LogOut } from 'lucide-react'

const navItems = [
  { path: '/',          label: 'Главная',   icon: Home },
  { path: '/search',   label: 'Поиск',     icon: Search },
  { path: '/events',   label: 'События',   icon: Calendar },
  { path: '/assistant',label: 'Ассистент', icon: MessageSquare },
  { path: '/profile',  label: 'Профиль',   icon: User },
]

const ACCENT = '#A855F7'
const ACCENT_BG = 'rgba(168,85,247,0.12)'

export default function Sidebar() {
  const { user, signOut } = useAuthStore()

  return (
    <aside
      className="hidden lg:flex lg:flex-col lg:w-64 h-screen sticky top-0"
      style={{ background: '#0A0A0A', borderRight: '1px solid rgba(255,255,255,0.06)' }}
    >
      <div className="p-6 pb-4">
        <h1 className="text-lg font-bold tracking-tight" style={{ color: ACCENT }}>
          Музыкальный ИИ
        </h1>
        <p className="text-sm mt-1 truncate" style={{ color: '#8E8E93' }}>
          {user?.display_name || user?.email}
        </p>
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
              >
                <item.icon className="h-4 w-4" />
                <span>{item.label}</span>
              </div>
            )}
          </NavLink>
        ))}
      </nav>

      <div style={{ height: 1, background: 'rgba(255,255,255,0.06)', margin: '0 16px' }} />

      <div className="p-3 mb-2">
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
      </div>
    </aside>
  )
}
