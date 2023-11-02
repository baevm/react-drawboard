import { TwoPoints } from '@/types'
import { describe, expect, it } from 'vitest'
import { Circle } from '../Circle'

describe('Tests Circle geometry functions', () => {
  it('calculates diameter', () => {
    const points: TwoPoints = {
      x1: 1,
      y1: 2,
      x2: 4,
      y2: 6,
    }

    const ans = 5

    const center = Circle.diameter(points)

    expect(center).toBe(ans)
  })

  it('returns true for point inside circle', () => {
    const point = {
      x: 1,
      y: 2,
    }

    const circlePoints: TwoPoints = {
      x1: -1,
      y1: 4,
      x2: 3,
      y2: -2,
    }

    const isInside = Circle.isInside(point, circlePoints)

    expect(isInside).toBe(true)
  })
})
