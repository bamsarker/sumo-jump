import * as PIXI from 'pixi.js'
import { TweenMax } from 'gsap/TweenMax'

import { Circle } from './Circle'
import {
  circleRadius,
  playerSpeed,
  knockBackDuration,
  enemySpeed
} from '../config'
import { moveTo, grow, shake } from './animations'
import { Cursors, Point } from '../interfaces'
import Player from './Player'

export class Enemy extends PIXI.Container {
  rotationSpeed: number
  xSpeed: number
  ySpeed: number
  target: Circle
  active: boolean
  startingPos: Point
  isKnockedBack: boolean
  sprite: PIXI.Sprite
  radius: number
  constructor({ x, y, sprite }) {
    super()

    this.x = x
    this.y = y

    this.radius = circleRadius / 2

    this.sprite = new PIXI.Sprite(PIXI.Texture.from(sprite))
    this.sprite.anchor.set(0.5, 0.5)
    this.sprite.scale.set(0.1)
    this.sprite.rotation = 90 * PIXI.DEG_TO_RAD

    this.startingPos = { x, y }

    this.xSpeed = 0
    this.ySpeed = 0
    this.isKnockedBack = false

    // this.addChild(new Circle({ x: 15, y: 0, color: 0x384d48, radius: 15 }))

    this.addChild(this.sprite)
  }

  activate = () => {
    this.active = true
  }

  deactivate = () => {
    TweenMax.killTweensOf(this)
    TweenMax.killTweensOf(this.position)
    this.active = false
  }

  reset = () => {
    this.active = true
    this.isKnockedBack = false
    this.position.x = this.startingPos.x
    this.position.y = this.startingPos.y
  }

  isMoving = () => this.xSpeed !== 0 || this.ySpeed !== 0

  pushBack = (strength: number, groundPound = false) => {
    if (this.isKnockedBack) return
    this.isKnockedBack = true

    const x = -strength * Math.cos(this.rotation) + this.x
    const y = -strength * Math.sin(this.rotation) + this.y

    moveTo(this, groundPound ? knockBackDuration : 0.1, {
      x,
      y
    }).then(() => (this.isKnockedBack = false))
  }

  private lookAt = (x: number, y: number) => {
    this.rotation = Math.atan2(y - this.position.y, x - this.position.x)
  }

  private normalizeSpeed = () => {
    if (Math.abs(this.xSpeed) + Math.abs(this.ySpeed) > playerSpeed) {
      const div = 1.45
      this.xSpeed = this.xSpeed > 0 ? playerSpeed / div : -playerSpeed / div
      this.ySpeed = this.ySpeed > 0 ? playerSpeed / div : -playerSpeed / div
    } else {
      this.xSpeed =
        this.xSpeed > 0 ? playerSpeed : this.xSpeed === 0 ? 0 : -playerSpeed
      this.ySpeed =
        this.ySpeed > 0 ? playerSpeed : this.ySpeed === 0 ? 0 : -playerSpeed
    }
  }

  moveForward = () => {
    const magnitude = enemySpeed
    const velX = Math.cos(this.rotation) * magnitude
    const velY = Math.sin(this.rotation) * magnitude
    this.position.x += velX
    this.position.y += velY
  }

  prevPos: Point
  update = (delta: number, opponent: Player) => {
    if (!this.active || this.isKnockedBack) return

    this.prevPos = { x: this.position.x, y: this.position.y }

    this.lookAt(opponent.x, opponent.y)
    this.moveForward()

    this.normalizeSpeed()

    this.position.x += this.xSpeed * delta
    this.position.y += this.ySpeed * delta
  }
}

export default Enemy
