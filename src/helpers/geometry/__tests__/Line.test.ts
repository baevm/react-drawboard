import { Point, TwoPoints } from '@/types'
import { describe, expect, it } from 'vitest'
import { Rectangle } from '../Rectangle'
import { Line } from '../Line'

describe('Tests Line geometry functions', () => {
  it('returns "inside" for point on line', () => {
    const linePoints: TwoPoints = {
      x1: 379,
      y1: 546,
      x2: 379,
      y2: 545,
    }

    const point: Point = {
      x: 379,
      y: 545.3,
    }

    const onLine = Line.isOnLine(point, linePoints)

    expect(onLine).toBe('inside')
  })

  it('returns null for point on line', () => {
    const linePoints: TwoPoints = {
      x1: 379,
      y1: 546,
      x2: 379,
      y2: 545,
    }

    const point: Point = {
      x: 400,
      y: 500,
    }

    const onLine = Line.isOnLine(point, linePoints)

    expect(onLine).toBeNull()
  })

  it('calculates distance between two points', () => {
    const linePointsFirst: Point = {
      x: 1,
      y: 2,
    }

    const linePointsSecond: Point = {
      x: 1,
      y: 5,
    }

    const distance = Line.distance(linePointsFirst, linePointsSecond)

    expect(distance).toBe(3)
  })
})
