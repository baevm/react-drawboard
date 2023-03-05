import { create } from 'zustand'

interface useFile {
  file: any
  setFile: (f: any) => void
}

export const useFile = create<useFile>()((set) => ({
  file: 1,

  setFile: (file) => set({ file }),
}))
