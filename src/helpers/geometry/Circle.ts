import { Point, TwoPoints } from '@/types'
import { ROUGH_SEED, roughGenerator } from '../rough'
import { round } from '../math'

export class Circle {
  static diameter({ x1, y1, x2, y2 }: TwoPoints) {
    return round(Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2)))
  }

  static center({ x1, y1, x2, y2 }: TwoPoints) {
    const centerX = (x1 + x2) / 2
    const centerY = (y1 + y2) / 2
    return { centerX, centerY }
  }

  static isInside(point: Point, { x1, y1, x2, y2 }: TwoPoints) {
    const { centerX, centerY } = this.center({ x1, y1, x2, y2 })
    const radius = this.diameter({ x1, y1, x2, y2 }) / 2
    return Math.pow(point.x - centerX, 2) + Math.pow(point.y - centerY, 2) <= Math.pow(radius, 2)
  }

  static createRoughCircle(tp: TwoPoints, options: any) {
    const { centerX, centerY } = Circle.center(tp)

    return roughGenerator.ellipse(centerX, centerY, tp.x2 - tp.x1, tp.y2 - tp.y1, {
      ...options,
      seed: ROUGH_SEED,
    })
  }
}
