import { Check, Music2, ShoppingBag, Trophy } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useNotesStore, SHOP_ITEMS } from '../stores/notesStore'

const ACCENT = '#A855F7'
const ACCENT_BG = 'rgba(168,85,247,0.12)'
const GREEN = '#34C759'
const GREEN_BG = 'rgba(52,199,89,0.12)'

const ITEM_ICONS: Record<string, React.ReactNode> = {
  profilePicture: <Music2 className="h-6 w-6" />,
  disableSarcasticBot: <span className="text-xl">🙄</span>,
  disableMinesweeperSearch: <span className="text-xl">💣</span>,
  disableFleeingLogout: <span className="text-xl">🚪</span>,
  disableGenreConveyor: <span className="text-xl">🎠</span>,
}

export default function ShopPage() {
  const { notes, unlocked, purchase } = useNotesStore()

  return (
    <div className="max-w-xl space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Магазин</h1>
          <p className="text-sm mt-0.5" style={{ color: '#8E8E93' }}>
            Тратьте Ноты на улучшения
          </p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 rounded-2xl" style={{ background: ACCENT_BG }}>
          <span className="text-lg" style={{ color: ACCENT }}>♩</span>
          <span className="text-lg font-bold" style={{ color: ACCENT }}>{notes}</span>
        </div>
      </div>

      {/* Earn hint */}
      <div
        className="flex items-center gap-3 p-4 rounded-2xl"
        style={{ background: '#1C1C1E', border: '1px solid rgba(255,255,255,0.04)' }}
      >
        <div className="flex items-center justify-center w-10 h-10 rounded-xl shrink-0" style={{ background: 'rgba(255,214,10,0.1)' }}>
          <Trophy className="h-5 w-5" style={{ color: '#FFD60A' }} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-white">Как зарабатывать Ноты?</p>
          <p className="text-xs mt-0.5" style={{ color: '#8E8E93' }}>
            Угадывайте мелодии в викторине — за каждый правильный ответ +10 ♩
          </p>
        </div>
        <Link
          to="/quiz"
          className="shrink-0 px-3 py-1.5 rounded-xl text-xs font-bold"
          style={{ background: ACCENT_BG, color: ACCENT }}
        >
          Играть
        </Link>
      </div>

      {/* Items */}
      <div className="space-y-3">
        {SHOP_ITEMS.map((item) => {
          const owned = unlocked[item.key]
          const canAfford = notes >= item.cost

          return (
            <div
              key={item.key}
              className="rounded-3xl p-4 flex items-center gap-4 transition-all"
              style={{
                background: '#1C1C1E',
                border: owned
                  ? '1px solid rgba(52,199,89,0.2)'
                  : '1px solid rgba(255,255,255,0.04)',
              }}
            >
              <div
                className="flex items-center justify-center w-12 h-12 rounded-2xl shrink-0"
                style={{ background: owned ? GREEN_BG : ACCENT_BG, color: owned ? GREEN : ACCENT }}
              >
                {owned ? <Check className="h-6 w-6" /> : ITEM_ICONS[item.key]}
              </div>

              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-white">{item.label}</p>
                <p className="text-xs mt-0.5" style={{ color: '#8E8E93' }}>{item.description}</p>
              </div>

              <div className="shrink-0">
                {owned ? (
                  <span
                    className="text-xs font-bold px-3 py-1.5 rounded-full"
                    style={{ background: GREEN_BG, color: GREEN }}
                  >
                    Куплено ✓
                  </span>
                ) : (
                  <button
                    type="button"
                    onClick={() => purchase(item.key, item.cost)}
                    disabled={!canAfford}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all"
                    style={
                      canAfford
                        ? { background: ACCENT_BG, color: ACCENT, border: `1px solid rgba(168,85,247,0.3)`, cursor: 'pointer' }
                        : { background: '#2C2C2E', color: '#636366', border: '1px solid rgba(255,255,255,0.04)', cursor: 'not-allowed' }
                    }
                  >
                    <span>♩</span>
                    {item.cost}
                  </button>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {notes < Math.min(...SHOP_ITEMS.filter(i => !unlocked[i.key]).map(i => i.cost), Infinity) && (
        <p className="text-center text-xs" style={{ color: '#636366' }}>
          Недостаточно ♩ — сыграйте в{' '}
          <Link to="/quiz" style={{ color: ACCENT }}>викторину</Link>, чтобы заработать больше
        </p>
      )}
    </div>
  )
}
