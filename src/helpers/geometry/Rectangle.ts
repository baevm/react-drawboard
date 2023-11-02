import { Point, TwoPoints } from '@/types'
import { ROUGH_SEED, roughGenerator } from '../rough'

export class Rectangle {
  static isInside({ x, y }: Point, { x1, y1, x2, y2 }: TwoPoints) {
    return x >= x1 && x <= x2 && y >= y1 && y <= y2
  }

  static createRoughRectangle(tp: TwoPoints, options: any) {
    return roughGenerator.rectangle(tp.x1, tp.y1, tp.x2 - tp.x1, tp.y2 - tp.y1, {
      ...options,
      seed: ROUGH_SEED,
    })
  }
}
