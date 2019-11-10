import * as PIXI from 'pixi.js'
import { arenaRadius } from '../config'
import { fade, grow } from './animations'

export class Arena extends PIXI.Graphics {
  color: number
  radius: number
  constructor({
    y,
    x,
    color,
    radius = arenaRadius
  }: {
    y: number
    x: number
    color: number
    radius?: number
  }) {
    super()
    this.color = color
    this.radius = radius
    this.lineStyle(4, 0xffd900, 1)
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

export default Arena
