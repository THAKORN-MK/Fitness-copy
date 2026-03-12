import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface SettingsState {
  weekStartsOn: 'sunday' | 'monday'
  language:     'th' | 'en'
  viewMode:     'list' | 'grid'
  setWeekStartsOn: (v: 'sunday' | 'monday') => void
  setLanguage:     (v: 'th' | 'en') => void
  setViewMode:     (v: 'list' | 'grid') => void
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      weekStartsOn: 'monday',
      language:     'th',
      viewMode:     'list',
      setWeekStartsOn: (v) => set({ weekStartsOn: v }),
      setLanguage:     (v) => set({ language: v }),
      setViewMode:     (v) => set({ viewMode: v }),
    }),
    { name: 'runtrack-settings' }
  )
)