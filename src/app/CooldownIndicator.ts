import * as PIXI from 'pixi.js'
import { circleRadius } from '../config'
import { promiseTo } from './animations'
import { Power1 } from 'gsap/TweenMax'

export class CooldownIndicator extends PIXI.Graphics {
  color: number
  radius: number
  constructor({
    y,
    x,
    color,
    parent,
    radius = circleRadius
  }: {
    y: number
    x: number
    color: number
    parent: PIXI.DisplayObject
    radius?: number
  }) {
    super()
    parent.addChild(this)
    this.color = color
    this.radius = radius
    this.x = x
    this.y = y
    this.beginFill(this.color)

    this.drawSlice(this.x, this.y, this.radius, 360 * PIXI.DEG_TO_RAD)
  }

  drawSlice = (
    x: number,
    y: number,
    outerRadius: number,
    sweep = Math.PI * 2
  ) =>
    this.arc(x, y, 0, sweep, 0, true)
      .arc(x, y, outerRadius, 0, sweep, false)
      .closePath()

  fillUp = (duration: number) => {
    const props = { angle: 0 }
    return promiseTo(props, duration, {
      angle: 360,
      ease: Power1.easeIn,
      onUpdate: () => {
        this.clear().beginFill(this.color)

        this.drawSlice(
          this.x,
          this.y,
          this.radius,
          props.angle * PIXI.DEG_TO_RAD
        )
      }
    })
  }
}

export default CooldownIndicator
