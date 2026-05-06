import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface Unlocks {
  profilePicture: boolean
  disableSarcasticBot: boolean
  disableMinesweeperSearch: boolean
  disableFleeingLogout: boolean
  disableGenreConveyor: boolean
}

export interface ShopItem {
  key: keyof Unlocks
  label: string
  description: string
  cost: number
}

export const SHOP_ITEMS: ShopItem[] = [
  {
    key: 'profilePicture',
    label: 'Смена аватара профиля',
    description: 'Разблокирует загрузку собственного фото профиля',
    cost: 50,
  },
  {
    key: 'disableSarcasticBot',
    label: 'Серьёзный ассистент',
    description: 'Отключает саркастические комментарии бота — отвечает по делу',
    cost: 100,
  },
  {
    key: 'disableMinesweeperSearch',
    label: 'Нормальный поиск',
    description: 'Убирает режим «Угадай, чё выкину» из поиска музыки',
    cost: 75,
  },
  {
    key: 'disableFleeingLogout',
    label: 'Послушная кнопка «Выйти»',
    description: 'Кнопка выхода перестанет убегать от курсора мыши',
    cost: 30,
  },
  {
    key: 'disableGenreConveyor',
    label: 'Стационарные жанры',
    description: 'Кнопки жанров в профиле перестанут двигаться конвейером',
    cost: 40,
  },
]

interface NotesState {
  notes: number
  unlocked: Unlocks
  addNotes: (amount: number) => void
  purchase: (item: keyof Unlocks, cost: number) => boolean
}

export const useNotesStore = create<NotesState>()(
  persist(
    (set, get) => ({
      notes: 0,
      unlocked: {
        profilePicture: false,
        disableSarcasticBot: false,
        disableMinesweeperSearch: false,
        disableFleeingLogout: false,
        disableGenreConveyor: false,
      },
      addNotes: (amount) => set((state) => ({ notes: state.notes + amount })),
      purchase: (item, cost) => {
        const { notes, unlocked } = get()
        if (unlocked[item] || notes < cost) return false
        set({ notes: notes - cost, unlocked: { ...unlocked, [item]: true } })
        return true
      },
    }),
    { name: 'music-notes-store' }
  )
)
