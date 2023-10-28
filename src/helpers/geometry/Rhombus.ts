import { TwoPoints } from '@/types'
import { ROUGH_SEED, roughGenerator } from '../rough'

export class Rhombus {
  static create({ x1, y1, x2, y2 }: TwoPoints) {
    return [
      [x1, y1 + (y2 - y1) / 2],
      [x1 + (x2 - x1) / 2, y1],
      [x2, y1 + (y2 - y1) / 2],
      [x1 + (x2 - x1) / 2, y2],
    ]
  }

  static createRoughRhombus(tp: TwoPoints, options: any) {
    const rhombus = Rhombus.create(tp)
    return roughGenerator.polygon([...(rhombus as any)], { ...options, seed: ROUGH_SEED })
  }
}
