import { useNavigate } from 'react-router-dom'
import { signInWithPopup, GoogleAuthProvider } from 'firebase/auth'
import { auth } from '../config/firebase'
import { useAuthStore } from '../stores/authStore'
import { useEffect, useState, useRef, useCallback } from 'react'
import { Music, Volume2 } from 'lucide-react'

const ACCENT = '#A855F7'
const ACCENT_BG = 'rgba(168,85,247,0.12)'
const GREEN = '#34C759'
const RED = '#FF375F'

// Three tones: low=220Hz, mid=440Hz, high=880Hz
const TONE_FREQS = [220, 440, 880]
const TONE_LABELS = ['Низкий', 'Средний', 'Высокий']

function shuffle<T>(arr: T[]): T[] {
  return [...arr].sort(() => Math.random() - 0.5)
}

// ── Audio Captcha ─────────────────────────────────────────────────────────────

interface AudioCaptchaProps {
  onSuccess: () => void
}

function AudioCaptcha({ onSuccess }: AudioCaptchaProps) {
  // Shuffle tone indices; highest is always index of 880 in shuffled array
  const [order] = useState<number[]>(() => shuffle([0, 1, 2]))
  const highestSlot = order.indexOf(2) // 2 = index of 880Hz in TONE_FREQS

  const [played, setPlayed] = useState<boolean[]>([false, false, false])
  const [selected, setSelected] = useState<number | null>(null)
  const [correct, setCorrect] = useState<boolean | null>(null)
  const [attempt, setAttempt] = useState(0)

  const ctxRef = useRef<AudioContext | null>(null)

  const playTone = useCallback((slot: number) => {
    if (!ctxRef.current || ctxRef.current.state === 'closed') {
      ctxRef.current = new AudioContext()
    }
    if (ctxRef.current.state === 'suspended') ctxRef.current.resume()

    const ctx = ctxRef.current
    const freq = TONE_FREQS[order[slot]]
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.connect(gain)
    gain.connect(ctx.destination)
    osc.type = 'sine'
    osc.frequency.value = freq
    gain.gain.setValueAtTime(0, ctx.currentTime)
    gain.gain.linearRampToValueAtTime(0.45, ctx.currentTime + 0.05)
    gain.gain.setValueAtTime(0.45, ctx.currentTime + 0.6)
    gain.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.75)
    osc.start(ctx.currentTime)
    osc.stop(ctx.currentTime + 0.75)

    setPlayed((prev) => {
      const next = [...prev]
      next[slot] = true
      return next
    })
  }, [order])

  const allPlayed = played.every(Boolean)

  const handleSelect = (slot: number) => {
    if (selected !== null) return
    setSelected(slot)
    const isCorrect = slot === highestSlot
    setCorrect(isCorrect)
    if (isCorrect) {
      setTimeout(onSuccess, 700)
    }
  }

  const retry = () => {
    setSelected(null)
    setCorrect(null)
    setPlayed([false, false, false])
    setAttempt((a) => a + 1)
  }

  // When attempt changes, reset order (generate new shuffle via key on parent)
  // We just reset UI here; parent re-mounts for new order
  return (
    <div
      key={attempt}
      className="space-y-3 p-4 rounded-2xl"
      style={{ background: '#1C1C1E', border: '1px solid rgba(255,255,255,0.06)' }}
    >
      <div className="flex items-center gap-2">
        <Volume2 className="h-4 w-4" style={{ color: ACCENT }} />
        <p className="text-sm font-semibold text-white">Аудио-проверка</p>
      </div>
      <p className="text-xs" style={{ color: '#8E8E93' }}>
        Прослушайте три звука и укажите, какой из них самый высокий по тону
      </p>

      {/* Play buttons */}
      <div className="flex gap-2">
        {[0, 1, 2].map((slot) => (
          <button
            key={slot}
            type="button"
            onClick={() => playTone(slot)}
            disabled={correct === true}
            className="flex-1 flex items-center justify-center gap-1 py-2 rounded-xl text-xs font-medium transition-all"
            style={{
              background: played[slot] ? 'rgba(168,85,247,0.15)' : '#2C2C2E',
              color: played[slot] ? ACCENT : '#8E8E93',
              border: `1px solid ${played[slot] ? 'rgba(168,85,247,0.3)' : 'rgba(255,255,255,0.06)'}`,
              cursor: 'pointer',
            }}
          >
            ▶ Звук {slot + 1}
          </button>
        ))}
      </div>

      {/* Select buttons */}
      <p className="text-xs" style={{ color: '#636366' }}>
        Какой звук был самым высоким?
      </p>
      <div className="flex gap-2">
        {[0, 1, 2].map((slot) => {
          let bg = '#2C2C2E'
          let color = '#8E8E93'
          let border = 'rgba(255,255,255,0.06)'

          if (selected !== null) {
            if (slot === highestSlot) {
              bg = 'rgba(52,199,89,0.15)'; color = GREEN; border = 'rgba(52,199,89,0.35)'
            } else if (slot === selected && !correct) {
              bg = 'rgba(255,55,95,0.15)'; color = RED; border = 'rgba(255,55,95,0.35)'
            }
          }

          return (
            <button
              key={slot}
              type="button"
              onClick={() => handleSelect(slot)}
              disabled={selected !== null || !allPlayed}
              className="flex-1 py-2 rounded-xl text-xs font-medium transition-all"
              style={{
                background: bg,
                color,
                border: `1px solid ${border}`,
                cursor: selected !== null || !allPlayed ? 'default' : 'pointer',
              }}
            >
              Звук {slot + 1}
            </button>
          )
        })}
      </div>

      {!allPlayed && selected === null && (
        <p className="text-xs" style={{ color: '#636366' }}>
          Сначала прослушайте все три звука
        </p>
      )}

      {correct === true && (
        <p className="text-xs font-medium" style={{ color: GREEN }}>✓ Верно! Выполняем вход…</p>
      )}

      {correct === false && (
        <div className="flex items-center justify-between">
          <p className="text-xs" style={{ color: RED }}>✗ Неверно. Попробуйте снова</p>
          <button
            type="button"
            onClick={retry}
            className="text-xs px-2.5 py-1 rounded-lg"
            style={{ background: ACCENT_BG, color: ACCENT }}
          >
            Заново
          </button>
        </div>
      )}
    </div>
  )
}

// ── Main page ─────────────────────────────────────────────────────────────────

export default function LoginPage() {
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const [captchaDone, setCaptchaDone] = useState(false)
  const [captchaKey, setCaptchaKey] = useState(0)

  useEffect(() => {
    if (user) {
      navigate(user.has_profile ? '/' : '/onboarding', { replace: true })
    }
  }, [user, navigate])

  const handleGoogleSignIn = async () => {
    if (!captchaDone) return
    try {
      const provider = new GoogleAuthProvider()
      await signInWithPopup(auth, provider)
    } catch (err) {
      console.error('Sign-in error:', err)
    }
  }

  const handleCaptchaSuccess = () => {
    setCaptchaDone(true)
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-black p-4 gap-8">
      {/* Logo */}
      <div className="flex items-center justify-center w-24 h-24 rounded-3xl" style={{ background: ACCENT_BG }}>
        <Music className="h-12 w-12" style={{ color: ACCENT }} />
      </div>

      <div className="text-center space-y-2">
        <h1 className="text-4xl font-bold text-white tracking-tight">Музыкальный ИИ</h1>
        <p className="text-base" style={{ color: '#8E8E93' }}>
          Диалоговая система в предметной области «Музыка»
        </p>
      </div>

      <div className="w-full max-w-xs space-y-4">
        {/* Captcha */}
        {!captchaDone && (
          <AudioCaptcha key={captchaKey} onSuccess={handleCaptchaSuccess} />
        )}

        {captchaDone && (
          <div
            className="flex items-center gap-2 p-3 rounded-2xl text-sm"
            style={{ background: 'rgba(52,199,89,0.1)', border: '1px solid rgba(52,199,89,0.25)' }}
          >
            <span style={{ color: GREEN }}>✓</span>
            <span style={{ color: GREEN }} className="font-medium">Проверка пройдена</span>
          </div>
        )}

        {/* Sign-in button */}
        <button
          type="button"
          onClick={handleGoogleSignIn}
          disabled={!captchaDone}
          className="w-full flex items-center justify-center gap-3 py-4 rounded-2xl font-bold text-base transition-all"
          style={{
            background: captchaDone ? '#1C1C1E' : '#111',
            color: captchaDone ? '#fff' : '#444',
            border: captchaDone ? '1px solid rgba(255,255,255,0.1)' : '1px solid rgba(255,255,255,0.04)',
            cursor: captchaDone ? 'pointer' : 'not-allowed',
          }}
          onMouseEnter={(e) => {
            if (captchaDone) e.currentTarget.style.borderColor = 'rgba(168,85,247,0.4)'
          }}
          onMouseLeave={(e) => {
            if (captchaDone) e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'
          }}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" style={{ opacity: captchaDone ? 1 : 0.3 }}>
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
          Войти через Google
        </button>
      </div>

      <p className="text-xs text-center max-w-xs" style={{ color: '#636366' }}>
        Лабораторная работа №6 · Вариант 9 · ЕЯзИИС
      </p>
    </div>
  )
}
