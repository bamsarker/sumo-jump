import * as PIXI from 'pixi.js'
import { arenaRadius, circleRadius } from '../config'
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
    const dist = distanceBetween({ x: 0, y: 0 }, pos)
    return dist > this.radius + circleRadius
  }

  checkBounds = (players: Player[]) => {
    this.updatePositionAndScale(players)
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

  updatePositionAndScale = (players: Player[]) => {
    const center = {
      x: (players[0].x + players[1].x) / 2,
      y: (players[0].y + players[1].y) / 2
    }
    this.pivot.x = center.x / 2
    this.pivot.y = center.y / 2

    const dist = distanceBetween(players[0].position, players[1].position)
    let scale = 0.97 + ((arenaRadius * 2) / dist) * 0.05
    this.scale.x = Math.min(1.2, scale)
    this.scale.y = this.scale.x
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
