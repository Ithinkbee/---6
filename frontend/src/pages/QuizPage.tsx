import { useState, useCallback, useRef } from 'react'
import { Play, Music2, Trophy, RotateCcw, ShoppingBag } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useNotesStore } from '../stores/notesStore'

const ACCENT = '#A855F7'
const ACCENT_BG = 'rgba(168,85,247,0.12)'
const GREEN = '#34C759'
const RED = '#FF375F'
const NOTES_PER_CORRECT = 10

const N: Record<string, number> = {
  C4: 261.63, D4: 293.66, E4: 329.63, F4: 349.23, G4: 392.00,
  A4: 440.00, B4: 493.88, C5: 523.25, D5: 587.33, E5: 659.25,
  Eb4: 311.13, Bb4: 466.16, Fs4: 369.99, Ds5: 622.25,
}

interface Note { freq: number; dur: number }

interface Question {
  id: number
  notes: Note[]
  options: string[]
  correctIndex: number
}

const BASE_QUESTIONS: Omit<Question, 'id'>[] = [
  {
    notes: [
      { freq: N.E4, dur: 0.3 }, { freq: N.E4, dur: 0.3 }, { freq: N.E4, dur: 0.6 },
      { freq: N.E4, dur: 0.3 }, { freq: N.E4, dur: 0.3 }, { freq: N.E4, dur: 0.6 },
      { freq: N.E4, dur: 0.3 }, { freq: N.G4, dur: 0.3 }, { freq: N.C4, dur: 0.3 },
      { freq: N.D4, dur: 0.3 }, { freq: N.E4, dur: 0.9 },
    ],
    options: ['Jingle Bells', 'Silent Night', 'O Christmas Tree', 'Rudolph'],
    correctIndex: 0,
  },
  {
    notes: [
      { freq: N.C4, dur: 0.3 }, { freq: N.C4, dur: 0.15 }, { freq: N.D4, dur: 0.45 },
      { freq: N.C4, dur: 0.45 }, { freq: N.F4, dur: 0.45 }, { freq: N.E4, dur: 0.9 },
      { freq: N.C4, dur: 0.3 }, { freq: N.C4, dur: 0.15 }, { freq: N.D4, dur: 0.45 },
      { freq: N.C4, dur: 0.45 }, { freq: N.G4, dur: 0.45 }, { freq: N.F4, dur: 0.9 },
    ],
    options: ["For He's a Jolly Good Fellow", 'Happy Birthday', 'Celebration', 'Congratulations'],
    correctIndex: 1,
  },
  {
    notes: [
      { freq: N.C4, dur: 0.4 }, { freq: N.C4, dur: 0.4 }, { freq: N.G4, dur: 0.4 }, { freq: N.G4, dur: 0.4 },
      { freq: N.A4, dur: 0.4 }, { freq: N.A4, dur: 0.4 }, { freq: N.G4, dur: 0.8 },
      { freq: N.F4, dur: 0.4 }, { freq: N.F4, dur: 0.4 }, { freq: N.E4, dur: 0.4 }, { freq: N.E4, dur: 0.4 },
      { freq: N.D4, dur: 0.4 }, { freq: N.D4, dur: 0.4 }, { freq: N.C4, dur: 0.8 },
    ],
    options: ['Twinkle Twinkle', 'ABCs Song', 'Baa Baa Black Sheep', 'Mary Had a Lamb'],
    correctIndex: 0,
  },
  {
    notes: [
      { freq: N.E4, dur: 0.35 }, { freq: N.E4, dur: 0.35 }, { freq: N.F4, dur: 0.35 }, { freq: N.G4, dur: 0.35 },
      { freq: N.G4, dur: 0.35 }, { freq: N.F4, dur: 0.35 }, { freq: N.E4, dur: 0.35 }, { freq: N.D4, dur: 0.35 },
      { freq: N.C4, dur: 0.35 }, { freq: N.C4, dur: 0.35 }, { freq: N.D4, dur: 0.35 }, { freq: N.E4, dur: 0.5 },
      { freq: N.D4, dur: 0.25 }, { freq: N.D4, dur: 0.7 },
    ],
    options: ['Лунная соната', 'К Элизе', 'Ода к Радости', 'Симфония №5'],
    correctIndex: 2,
  },
  {
    notes: [
      { freq: N.E5, dur: 0.22 }, { freq: N.Ds5, dur: 0.22 }, { freq: N.E5, dur: 0.22 }, { freq: N.Ds5, dur: 0.22 },
      { freq: N.E5, dur: 0.22 }, { freq: N.B4, dur: 0.22 }, { freq: N.D5, dur: 0.22 }, { freq: N.C5, dur: 0.22 },
      { freq: N.A4, dur: 0.65 },
    ],
    options: ['К Элизе', 'Лунная соната', 'Патетическая соната', 'Ода к Радости'],
    correctIndex: 0,
  },
  {
    notes: [
      { freq: N.G4, dur: 0.25 }, { freq: N.G4, dur: 0.25 }, { freq: N.G4, dur: 0.25 }, { freq: N.Eb4, dur: 0.9 },
      { freq: N.F4, dur: 0.25 }, { freq: N.F4, dur: 0.25 }, { freq: N.F4, dur: 0.25 }, { freq: N.D4, dur: 0.9 },
    ],
    options: ['Ода к Радости', 'Симфония №9', 'К Элизе', 'Симфония №5'],
    correctIndex: 3,
  },
  {
    notes: [
      { freq: N.G4, dur: 0.4 }, { freq: N.G4, dur: 0.4 }, { freq: N.G4, dur: 0.4 },
      { freq: N.Eb4, dur: 0.27 }, { freq: N.Bb4, dur: 0.13 },
      { freq: N.G4, dur: 0.5 }, { freq: N.Eb4, dur: 0.27 }, { freq: N.Bb4, dur: 0.13 }, { freq: N.G4, dur: 0.9 },
    ],
    options: ['Звёздный путь', 'Indiana Jones', 'Имперский марш', 'Jurassic Park'],
    correctIndex: 2,
  },
  {
    notes: [
      { freq: N.D4, dur: 0.5 }, { freq: N.A4, dur: 0.5 }, { freq: N.B4, dur: 0.5 }, { freq: N.Fs4, dur: 0.5 },
      { freq: N.G4, dur: 0.5 }, { freq: N.D4, dur: 0.5 }, { freq: N.G4, dur: 0.5 }, { freq: N.A4, dur: 0.5 },
    ],
    options: ['Канон Пахельбеля', 'Реквием', 'Времена года', 'Лебедь'],
    correctIndex: 0,
  },
]

function shuffleQuestions(): Question[] {
  return [...BASE_QUESTIONS]
    .sort(() => Math.random() - 0.5)
    .map((q, id) => {
      const correct = q.options[q.correctIndex]
      const shuffledOpts = [...q.options].sort(() => Math.random() - 0.5)
      return { ...q, id, options: shuffledOpts, correctIndex: shuffledOpts.indexOf(correct) }
    })
}

function playMelody(notes: Note[], ctx: AudioContext): number {
  let time = ctx.currentTime + 0.05
  for (const { freq, dur } of notes) {
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.connect(gain)
    gain.connect(ctx.destination)
    osc.type = 'triangle'
    osc.frequency.value = freq
    gain.gain.setValueAtTime(0, time)
    gain.gain.linearRampToValueAtTime(0.3, time + 0.02)
    gain.gain.setValueAtTime(0.3, time + dur * 0.75)
    gain.gain.linearRampToValueAtTime(0, time + dur)
    osc.start(time)
    osc.stop(time + dur + 0.01)
    time += dur
  }
  return time - ctx.currentTime
}

export default function QuizPage() {
  const { notes, addNotes } = useNotesStore()

  const [questions] = useState(shuffleQuestions)
  const [current, setCurrent] = useState(0)
  const [selected, setSelected] = useState<number | null>(null)
  const [score, setScore] = useState(0)
  const [earnedTotal, setEarnedTotal] = useState(0)
  const [finished, setFinished] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)
  const [hasPlayed, setHasPlayed] = useState(false)

  const ctxRef = useRef<AudioContext | null>(null)

  const q = questions[current]
  const isAnswered = selected !== null

  const handlePlay = useCallback(() => {
    if (isPlaying) return
    if (!ctxRef.current || ctxRef.current.state === 'closed') {
      ctxRef.current = new AudioContext()
    }
    if (ctxRef.current.state === 'suspended') {
      ctxRef.current.resume()
    }
    const duration = playMelody(q.notes, ctxRef.current)
    setIsPlaying(true)
    setHasPlayed(true)
    setTimeout(() => setIsPlaying(false), duration * 1000)
  }, [q, isPlaying])

  const handleSelect = (optionIndex: number) => {
    if (isAnswered || !hasPlayed) return
    setSelected(optionIndex)
    const correct = optionIndex === q.correctIndex
    if (correct) {
      setScore((s) => s + 1)
      setEarnedTotal((e) => e + NOTES_PER_CORRECT)
      addNotes(NOTES_PER_CORRECT)
    }
    setTimeout(() => {
      if (current + 1 >= questions.length) {
        setFinished(true)
      } else {
        setCurrent((c) => c + 1)
        setSelected(null)
        setHasPlayed(false)
      }
    }, 1600)
  }

  const restart = () => {
    setCurrent(0)
    setSelected(null)
    setScore(0)
    setEarnedTotal(0)
    setFinished(false)
    setHasPlayed(false)
  }

  if (finished) {
    return (
      <div className="max-w-md mx-auto space-y-6 py-8" style={{ animation: 'quiz-fade-in 0.3s ease' }}>
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center w-20 h-20 rounded-3xl mx-auto" style={{ background: 'rgba(255,214,10,0.12)' }}>
            <Trophy className="h-10 w-10" style={{ color: '#FFD60A' }} />
          </div>
          <h1 className="text-2xl font-bold text-white">Викторина завершена!</h1>
          <p className="text-sm" style={{ color: '#8E8E93' }}>
            Правильных ответов: {score} из {questions.length}
          </p>
          <div className="rounded-2xl p-4 space-y-1" style={{ background: ACCENT_BG, border: '1px solid rgba(168,85,247,0.25)' }}>
            <p className="text-lg font-bold" style={{ color: ACCENT }}>+{earnedTotal} ♩ заработано</p>
            <p className="text-sm" style={{ color: '#8E8E93' }}>Итого на счету: {notes} ♩</p>
          </div>
        </div>

        <div className="flex gap-3">
          <button
            type="button"
            onClick={restart}
            className="flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl font-bold text-sm"
            style={{ background: ACCENT_BG, color: ACCENT, border: `1px solid rgba(168,85,247,0.3)` }}
          >
            <RotateCcw className="h-4 w-4" />
            Играть снова
          </button>
          <Link
            to="/shop"
            className="flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl font-bold text-sm"
            style={{ background: '#1C1C1E', color: '#fff', border: '1px solid rgba(255,255,255,0.08)' }}
          >
            <ShoppingBag className="h-4 w-4" />
            В магазин
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-md mx-auto space-y-5 py-4" style={{ animation: 'quiz-fade-in 0.3s ease' }}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">Музыкальная Викторина</h1>
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full" style={{ background: ACCENT_BG }}>
          <span style={{ color: ACCENT }}>♩</span>
          <span className="text-sm font-bold" style={{ color: ACCENT }}>{notes}</span>
        </div>
      </div>

      {/* Progress */}
      <div>
        <div className="flex justify-between text-xs mb-1.5" style={{ color: '#8E8E93' }}>
          <span>Вопрос {current + 1} из {questions.length}</span>
          <span>Счёт: {score} (+{earnedTotal} ♩)</span>
        </div>
        <div className="h-1.5 rounded-full overflow-hidden" style={{ background: '#2C2C2E' }}>
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{ width: `${((current + 1) / questions.length) * 100}%`, background: ACCENT }}
          />
        </div>
      </div>

      {/* Play card */}
      <div className="rounded-3xl p-6 text-center space-y-4" style={{ background: '#1C1C1E' }}>
        <div className="flex items-center justify-center w-16 h-16 rounded-3xl mx-auto" style={{ background: ACCENT_BG }}>
          <Music2 className="h-8 w-8" style={{ color: ACCENT }} />
        </div>
        <div>
          <p className="text-white font-semibold">Что это за мелодия?</p>
          <p className="text-xs mt-1" style={{ color: '#8E8E93' }}>
            {hasPlayed ? 'Выберите правильный ответ' : 'Прослушайте отрывок и выберите ответ'}
          </p>
        </div>
        <button
          type="button"
          onClick={handlePlay}
          disabled={isPlaying || isAnswered}
          className="flex items-center gap-2 px-6 py-3 rounded-full font-bold text-sm mx-auto transition-all"
          style={
            isPlaying
              ? { background: 'rgba(168,85,247,0.3)', color: ACCENT, cursor: 'wait' }
              : isAnswered
              ? { background: '#2C2C2E', color: '#636366', cursor: 'default' }
              : { background: ACCENT, color: '#000', cursor: 'pointer' }
          }
        >
          <Play className="h-4 w-4" fill="currentColor" />
          {isPlaying ? 'Играет…' : hasPlayed ? 'Повторить' : 'Воспроизвести'}
        </button>
      </div>

      {/* Options */}
      <div className="grid grid-cols-2 gap-2">
        {q.options.map((opt, i) => {
          let bg = '#1C1C1E'
          let color = '#fff'
          let border = 'rgba(255,255,255,0.08)'

          if (isAnswered) {
            if (i === q.correctIndex) {
              bg = 'rgba(52,199,89,0.15)'; color = GREEN; border = 'rgba(52,199,89,0.4)'
            } else if (i === selected) {
              bg = 'rgba(255,55,95,0.15)'; color = RED; border = 'rgba(255,55,95,0.4)'
            }
          } else if (!hasPlayed) {
            bg = '#1C1C1E'; color = '#636366'; border = 'rgba(255,255,255,0.04)'
          }

          return (
            <button
              key={i}
              type="button"
              onClick={() => handleSelect(i)}
              disabled={isAnswered || !hasPlayed}
              className="py-3 px-4 rounded-2xl text-sm font-medium text-left transition-all"
              style={{ background: bg, color, border: `1px solid ${border}` }}
            >
              {opt}
            </button>
          )
        })}
      </div>

      {!hasPlayed && (
        <p className="text-center text-xs" style={{ color: '#636366' }}>
          Сначала прослушайте мелодию, затем выбирайте
        </p>
      )}

      {isAnswered && (
        <p className="text-center text-sm font-medium" style={{ color: selected === q.correctIndex ? GREEN : RED }}>
          {selected === q.correctIndex
            ? `+${NOTES_PER_CORRECT} ♩ · Правильно!`
            : `Неверно. Правильный ответ: «${q.options[q.correctIndex]}»`}
        </p>
      )}
    </div>
  )
}
