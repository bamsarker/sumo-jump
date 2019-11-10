import { Point } from './interfaces'

export const distanceBetween = (p1: Point, p2: Point) => {
  var a = p1.x - p2.x
  var b = p1.y - p2.y

  return Math.sqrt(a * a + b * b)
}
