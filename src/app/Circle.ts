import * as PIXI from 'pixi.js'
import { circleRadius } from '../config'
import { fade, grow } from './animations'

export class Circle extends PIXI.Graphics {
  color: number
  radius: number
  constructor({
    y,
    x,
    color,
    radius = circleRadius
  }: {
    y: number
    x: number
    color: number
    radius?: number
  }) {
    super()
    this.color = color
    this.radius = radius
    this.beginFill(this.color).drawCircle(0, 0, this.radius)
    this.x = x
    this.y = y
  }

  redraw = () => {
    this.clear()
      .beginFill(this.color)
      .drawCircle(0, 0, this.radius)
  }

  appear = (alpha: number = 0.8) =>
    Promise.all([fade(this, undefined, alpha), grow(this, 1)])
  disappear = (size?: number) => Promise.all([fade(this), grow(this, size)])
}

export default Circle
