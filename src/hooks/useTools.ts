import { Tool } from '@/types'
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface UseTools {
  tool: Tool
  setTool: (t: Tool) => void
}

export const useTools = create<UseTools>()(
  persist(
    (set, get) => ({
      tool: 'pen',
      setTool: (tool) => set({ tool }),
    }),
    {
      name: 'current-tool',
      partialize: (state) => ({ tool: state.tool }),
    }
  )
)
