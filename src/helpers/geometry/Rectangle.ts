import { TwoPoints } from '@/types'

export class Rectangle {
  static isInside(x: number, y: number, { x1, y1, x2, y2 }: TwoPoints) {
    return x >= x1 && x <= x2 && y >= y1 && y <= y2
  }
}
