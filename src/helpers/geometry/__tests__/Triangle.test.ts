import { Point, TwoPoints } from '@/types'
import { describe, expect, it } from 'vitest'
import { Triangle } from '../Triangle'

describe('Tests Triangle geometry functions', () => {
  it('checks if point is inside triangle', () => {
    const trianglePoints: TwoPoints = {
      x1: 390,
      y1: 276,
      x2: 612,
      y2: 275,
    }

    const point: Point = {
      x: 500,
      y: 234,
    }

    const isInside = Triangle.isInside(point, trianglePoints)

    expect(isInside).toBe(true)
  })
})
