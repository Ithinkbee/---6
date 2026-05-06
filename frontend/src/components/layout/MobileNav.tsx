import { NavLink } from 'react-router-dom'
import { Home, Search, Calendar, MessageSquare, User, Music2, ShoppingBag } from 'lucide-react'

const navItems = [
  { path: '/',           label: 'Главная',   icon: Home },
  { path: '/search',    label: 'Поиск',     icon: Search },
  { path: '/assistant', label: 'Ассистент', icon: MessageSquare },
  { path: '/quiz',      label: 'Викторина', icon: Music2 },
  { path: '/shop',      label: 'Магазин',   icon: ShoppingBag },
  { path: '/events',    label: 'События',   icon: Calendar },
  { path: '/profile',   label: 'Профиль',   icon: User },
]

const ACCENT = '#A855F7'
const ACCENT_BG = 'rgba(168,85,247,0.15)'

export default function MobileNav() {
  return (
    <nav
      className="lg:hidden fixed bottom-4 left-2 right-2 z-50"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
    >
      <div
        className="flex justify-around items-center py-1.5 px-1 rounded-full shadow-2xl"
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
              <div className="flex flex-col items-center gap-0.5 px-1 py-1 transition-all">
                <div
                  className="flex items-center justify-center w-8 h-8 rounded-full transition-all"
                  style={isActive ? { background: ACCENT_BG } : {}}
                >
                  <item.icon
                    className="h-4 w-4 transition-colors"
                    style={{ color: isActive ? ACCENT : '#8E8E93' }}
                  />
                </div>
                <span
                  className="text-[9px] font-medium transition-colors leading-tight"
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
