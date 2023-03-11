import { HEX } from '@/types'

export const addAlpha = (color: HEX, opacity: number): HEX => {
  const _opacity = Math.round(Math.min(Math.max(opacity || 1, 0), 1) * 255)
  return (color + _opacity.toString(16).toUpperCase()) as HEX
}
