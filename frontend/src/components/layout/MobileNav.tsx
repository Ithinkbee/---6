import { NavLink } from 'react-router-dom'
import { Home, Search, Calendar, MessageSquare, User } from 'lucide-react'

const navItems = [
  { path: '/',          label: 'Главная',   icon: Home },
  { path: '/search',   label: 'Поиск',     icon: Search },
  { path: '/events',   label: 'События',   icon: Calendar },
  { path: '/assistant',label: 'Ассистент', icon: MessageSquare },
  { path: '/profile',  label: 'Профиль',   icon: User },
]

const ACCENT = '#A855F7'
const ACCENT_BG = 'rgba(168,85,247,0.15)'

export default function MobileNav() {
  return (
    <nav
      className="lg:hidden fixed bottom-4 left-3 right-3 z-50"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
    >
      <div
        className="flex justify-around items-center py-2 px-1 rounded-full shadow-2xl"
        style={{ background: '#1C1C1E', backdropFilter: 'blur(20px)' }}
      >
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.path === '/'}
            className="flex-1"
          >
            {({ isActive }) => (
              <div className="flex flex-col items-center gap-0.5 px-2 py-1.5 transition-all">
                <div
                  className="flex items-center justify-center w-9 h-9 rounded-full transition-all"
                  style={isActive ? { background: ACCENT_BG } : {}}
                >
                  <item.icon
                    className="h-5 w-5 transition-colors"
                    style={{ color: isActive ? ACCENT : '#8E8E93' }}
                  />
                </div>
                <span
                  className="text-[10px] font-medium transition-colors"
                  style={{ color: isActive ? ACCENT : '#8E8E93' }}
                >
                  {item.label}
                </span>
              </div>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  )
}
