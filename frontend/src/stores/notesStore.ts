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

const INITIAL_UNLOCKS: Unlocks = {
  profilePicture: false,
  disableSarcasticBot: false,
  disableMinesweeperSearch: false,
  disableFleeingLogout: false,
  disableGenreConveyor: false,
}

interface UserData {
  notes: number
  unlocked: Unlocks
  avatarDataUrl: string | null
}

const FRESH_DATA = (): UserData => ({
  notes: 0,
  unlocked: { ...INITIAL_UNLOCKS },
  avatarDataUrl: null,
})

interface NotesState {
  notes: number
  unlocked: Unlocks
  avatarDataUrl: string | null
  ownerUid: string | null
  _perUser: Record<string, UserData>
  addNotes: (amount: number) => void
  purchase: (item: keyof Unlocks, cost: number) => boolean
  setAvatar: (url: string | null) => void
  switchUser: (uid: string, isGuest: boolean) => void
  deleteGuestData: (uid: string) => void
}

export const useNotesStore = create<NotesState>()(
  persist(
    (set, get) => ({
      notes: 0,
      unlocked: { ...INITIAL_UNLOCKS },
      avatarDataUrl: null,
      ownerUid: null,
      _perUser: {},

      addNotes: (amount) => set((state) => ({ notes: state.notes + amount })),

      purchase: (item, cost) => {
        const { notes, unlocked } = get()
        if (unlocked[item] || notes < cost) return false
        set({ notes: notes - cost, unlocked: { ...unlocked, [item]: true } })
        return true
      },

      setAvatar: (url) => set({ avatarDataUrl: url }),

      switchUser: (uid, isGuest) => {
        const { ownerUid, notes, unlocked, avatarDataUrl, _perUser } = get()

        // Same user re-authenticating (page reload) — nothing to do
        if (ownerUid === uid) return

        const newPerUser = { ..._perUser }

        // Persist current user's active data before switching away
        if (ownerUid !== null) {
          newPerUser[ownerUid] = { notes, unlocked, avatarDataUrl }
        }

        // Guests always start fresh; known users restore their saved data
        const userData = isGuest
          ? FRESH_DATA()
          : (newPerUser[uid] ?? FRESH_DATA())

        set({
          ownerUid: uid,
          notes: userData.notes,
          unlocked: { ...userData.unlocked },
          avatarDataUrl: userData.avatarDataUrl,
          _perUser: newPerUser,
        })
      },

      deleteGuestData: (uid) => {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { [uid]: _removed, ...rest } = get()._perUser
        set({ ...FRESH_DATA(), ownerUid: null, _perUser: rest })
      },
    }),
    { name: 'music-notes-store' }
  )
)
