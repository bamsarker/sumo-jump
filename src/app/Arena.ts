import * as PIXI from 'pixi.js'
import { arenaRadius } from '../config'
import { fade, grow } from './animations'
import Player from './Player'
import { Point } from '../interfaces'
import { distanceBetween } from '../utils'

export class Arena extends PIXI.Graphics {
  color: number
  radius: number
  constructor({
    y,
    x,
    radius = arenaRadius
  }: {
    y: number
    x: number
    radius?: number
  }) {
    super()
    this.color = 0xffeecf
    this.radius = radius
    this.beginFill(this.color).drawCircle(0, 0, this.radius)
    this.x = x
    this.y = y
  }

  positionInBounds = (pos: Point) => {
    const dist = distanceBetween(pos, this.position)
    return dist > this.radius
  }

  checkBounds = (players: Player[]) => {
    players
      .filter(p => p.active)
      .forEach(p => {
        if (this.positionInBounds(p.position)) {
          const opponent = players.find(player => player !== p)
          opponent.scorePoint()
          opponent.deactivate()
          p.deactivate()
          setTimeout(() => {
            opponent.reset()
            p.reset()
          }, 1000)
        }
      })
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
