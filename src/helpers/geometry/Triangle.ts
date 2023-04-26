import { Point, TwoPoints } from '@/types'

export class Triangle {
  static isInside(x: number, y: number, { x1, x2, y1, y2 }: TwoPoints) {
    // x >= x1 && x <= x2 && y >= y1 && y <= y2

    const midpoint_x = (x1 + x2) / 2
    const midpoint_y = (y1 + y2) / 2

    const x3 = midpoint_x + (y2 - y1) / 2
    const y3 = midpoint_y - (x2 - x1) / 2

    const a = ((y2 - y3) * (x - x3) + (x3 - x2) * (y - y3)) / ((y2 - y3) * (x1 - x3) + (x3 - x2) * (y1 - y3))
    const b = ((y3 - y1) * (x - x3) + (x1 - x3) * (y - y3)) / ((y2 - y3) * (x1 - x3) + (x3 - x2) * (y1 - y3))
    const c = 1 - a - b

    return a > 0 && b > 0 && c > 0
  }

  static createEquilateral({ x1, y1, x2, y2 }: TwoPoints) {
    const midpoint_x = (x1 + x2) / 2
    const midpoint_y = (y1 + y2) / 2

    const third_point_x = midpoint_x + (y2 - y1) / 2
    const third_point_y = midpoint_y - (x2 - x1) / 2

    return [
      [x1, y1],
      [x2, y2],
      [third_point_x, third_point_y],
    ]
  }

  static createRightAngle({ x1, y1, x2, y2 }: TwoPoints) {
    return [
      [x1, y2],
      [x2, y1],
      [x1, y1],
    ]
  }
}
