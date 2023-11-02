import { Point, TwoPoints } from '@/types'
import { describe, expect, it } from 'vitest'
import { Rectangle } from '../Rectangle'

describe('Tests Rectangle geometry functions', () => {
  it('checks if point is inside rectangle', () => {
    const rectanglePoints: TwoPoints = {
      x1: 397,
      y1: 180,
      x2: 632,
      y2: 343,
    }

    const point: Point = {
      x: 419,
      y: 206,
    }

    const isInside = Rectangle.isInside(point, rectanglePoints)

    expect(isInside).toBe(true)
  })
})
