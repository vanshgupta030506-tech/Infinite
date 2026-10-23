import type { Point } from './types'

export const defaultShape: Point[] = [
  { x: -0.76, y: -0.35 },
  { x: -0.58, y: -0.72 },
  { x: -0.16, y: -0.68 },
  { x: 0.19, y: -0.87 },
  { x: 0.55, y: -0.72 },
  { x: 0.69, y: -0.34 },
  { x: 0.83, y: 0.04 },
  { x: 0.71, y: 0.42 },
  { x: 0.46, y: 0.67 },
  { x: 0.15, y: 0.58 },
  { x: -0.08, y: 0.84 },
  { x: -0.43, y: 0.68 },
  { x: -0.54, y: 0.37 },
  { x: -0.83, y: 0.1 },
]

export function normalizePoints(points: Point[]): Point[] {
  if (points.length < 3) return defaultShape
  const xs = points.map(({ x }) => x)
  const ys = points.map(({ y }) => y)
  const centerX = (Math.min(...xs) + Math.max(...xs)) / 2
  const centerY = (Math.min(...ys) + Math.max(...ys)) / 2
  const maxExtent = Math.max(
    (Math.max(...xs) - Math.min(...xs)) / 2,
    (Math.max(...ys) - Math.min(...ys)) / 2,
    Number.EPSILON,
  )
  return points.map(({ x, y }) => ({
    x: ((x - centerX) / maxExtent) * 0.87,
    y: ((y - centerY) / maxExtent) * 0.87,
  }))
}

export function simplifyPoints(points: Point[], tolerance = 0.012): Point[] {
  if (points.length <= 3) return points
  const result = [points[0]]
  for (let i = 1; i < points.length - 1; i += 1) {
    const previous = result[result.length - 1]
    const current = points[i]
    if (Math.hypot(current.x - previous.x, current.y - previous.y) >= tolerance) {
      result.push(current)
    }
  }
  result.push(points[points.length - 1])
  if (result.length > 3 && Math.hypot(result[0].x - result[result.length - 1].x, result[0].y - result[result.length - 1].y) < tolerance) {
    result.pop()
  }
  return result
}

export function createSmoothShapePath(
  points: Point[],
  complexity = 0,
): Path2D {
  const path = new Path2D()
  if (points.length < 3) return path
  const varied = points.map((point) => {
    if (complexity <= 0) return point
    const angle = Math.atan2(point.y, point.x)
    const detail = Math.sin(angle * 5 + 0.7) * 0.45
      + Math.sin(angle * 8 - 1.2) * 0.32
      + Math.cos(angle * 3 + 2.1) * 0.23
    const amount = complexity * 0.018 * detail
    const radial = Math.hypot(point.x, point.y) || 1
    return {
      x: point.x + (point.x / radial) * amount,
      y: point.y + (point.y / radial) * amount,
    }
  })
  path.moveTo(varied[0].x, varied[0].y)
  for (let i = 0; i < varied.length; i += 1) {
    const p0 = varied[(i - 1 + varied.length) % varied.length]
    const p1 = varied[i]
    const p2 = varied[(i + 1) % varied.length]
    const p3 = varied[(i + 2) % varied.length]
    path.bezierCurveTo(
      p1.x + (p2.x - p0.x) / 6,
      p1.y + (p2.y - p0.y) / 6,
      p2.x - (p3.x - p1.x) / 6,
      p2.y - (p3.y - p1.y) / 6,
      p2.x,
      p2.y,
    )
  }
  path.closePath()
  return path
}
