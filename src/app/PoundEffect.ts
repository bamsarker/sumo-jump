import * as PIXI from 'pixi.js'
import { fade, grow } from './animations'
import { Point } from '../interfaces'
import { Power2 } from 'gsap/TweenMax'

export class PoundEffect extends PIXI.Graphics {
  constructor({
    y,
    x,
    color,
    radius
  }: {
    y: number
    x: number
    color: number
    radius: number
  }) {
    super()
    this.beginFill(color).drawCircle(0, 0, radius)
    this.x = x
    this.y = y
  }

  play = (point: Point) => {
    this.position.x = point.x
    this.position.y = point.y
    this.scale.x = 1
    this.scale.y = 1
    this.alpha = 0.25
    return Promise.all([fade(this, 0.5, 0), grow(this, 5, 0.5, Power2.easeOut)])
  }
}

export default PoundEffect
