import { Point, TwoPoints } from '@/types'

export class Line {
  static isOnLine({ x1, y1, x2, y2 }: TwoPoints, x: number, y: number) {
    const maxDistance = 1
    const a = { x: x1, y: y1 }
    const b = { x: x2, y: y2 }
    const c = { x, y }
    const offset = this.distance(a, b) - (this.distance(a, c) + this.distance(b, c))
    return Math.abs(offset) < maxDistance ? 'inside' : null
  }

  static isBetweenAnyPoint(points: Point[], { x, y }: Point) {
    return points.some((point, index) => {
      const nextPoint = points[index + 1]
      if (!nextPoint) return false
      return Line.isOnLine({ x1: point.x, y1: point.y, x2: nextPoint.x, y2: nextPoint.y }, x, y) != null
    })
  }

  static createLineWithArrow({ x1, y1, x2, y2 }: TwoPoints) {
    let PI = Math.PI
    let degreesInRadians225 = (225 * PI) / 180
    let degreesInRadians135 = (135 * PI) / 180

    // calc the angle of the line
    let dx = x2 - x1
    let dy = y2 - y1
    let angle = Math.atan2(dy, dx)

    // calc arrowhead points
    let x225 = x2 + 20 * Math.cos(angle + degreesInRadians225)
    let y225 = y2 + 20 * Math.sin(angle + degreesInRadians225)
    let x135 = x2 + 20 * Math.cos(angle + degreesInRadians135)
    let y135 = y2 + 20 * Math.sin(angle + degreesInRadians135)

    const arrow = [
      [x1, y1],
      [x2, y2],
      [x225, y225],
      [x135, y135],
      [x2, y2],
    ]

    return arrow
  }

  static createHandDrawnLine({ x1, y1, x2, y2 }: TwoPoints) {}

  static distance(a: Point, b: Point) {
    return Math.sqrt(Math.pow(a.x - b.x, 2) + Math.pow(a.y - b.y, 2))
  }
}
