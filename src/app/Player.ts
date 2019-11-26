import * as PIXI from 'pixi.js'
import { Circle } from './Circle'
import {
  circleRadius,
  playerSpeed,
  jumpCooldownTime,
  circleLightColors,
  circleColors,
  jumpDuration,
  knockBackDuration
} from '../config'
import { moveTo, grow, shake } from './animations'
import { Linear, Circ } from 'gsap/TweenMax'
import { Cursors, Point } from '../interfaces'
import { ScoreText } from './ScoreText'
import PoundEffect from './PoundEffect'
import CooldownIndicator from './CooldownIndicator'
import { distanceBetween } from '../utils'

export class Player extends PIXI.Container {
  rotationSpeed: number
  xSpeed: number
  ySpeed: number
  target: Circle
  active: boolean
  startingPos: Point
  isGrounded: boolean
  isKnockedBack: boolean
  handleGroundPound: (pounder: Player) => void
  score: number
  scoreText: ScoreText
  poundEffect: PoundEffect
  jumpAvailable: boolean
  cooldownIndicator: CooldownIndicator
  sprite: PIXI.Sprite
  greySprite: PIXI.Sprite
  constructor({ x, y, color, keys, handleGroundPound, scoreText, sprite }) {
    super()

    this.x = x
    this.y = y

    this.sprite = new PIXI.Sprite(PIXI.Texture.from(sprite))
    this.sprite.anchor.set(0.5, 0.5)
    this.sprite.scale.set(0.1)
    this.sprite.rotation = 90 * PIXI.DEG_TO_RAD

    this.greySprite = new PIXI.Sprite(PIXI.Texture.from('grey_pants'))
    this.greySprite.anchor.set(0.5, 0.5)
    this.greySprite.scale.set(0.1)
    this.greySprite.rotation = 90 * PIXI.DEG_TO_RAD
    this.greySprite.visible = false

    this.startingPos = { x, y }
    this.poundEffect = new PoundEffect({
      x,
      y,
      color,
      radius: circleRadius
    })
    this.xSpeed = 0
    this.ySpeed = 0
    this.score = 0
    this.scoreText = scoreText
    this.isGrounded = true
    this.jumpAvailable = true
    this.isKnockedBack = false

    this.cooldownIndicator = new CooldownIndicator({
      x: 0,
      y: 0,
      parent: this,
      color,
      radius: circleRadius
    })

    this.handleGroundPound = handleGroundPound

    this.addChild(new Circle({ x: 15, y: 0, color: 0x384d48, radius: 15 }))
    this.target = new Circle({
      x: circleRadius * 6,
      y: 0,
      color: 0x88888800,
      radius: 5
    })
    this.target.alpha = 0
    this.addChild(this.target)

    this.addChild(this.sprite)
    this.addChild(this.greySprite)

    this.addCursors({
      up: {
        key: keys.up,
        downCallback: () => (this.ySpeed = -playerSpeed),
        upCallback: () => (this.ySpeed = 0)
      },
      down: {
        key: keys.down,
        downCallback: () => (this.ySpeed = playerSpeed),
        upCallback: () => (this.ySpeed = 0)
      },
      left: {
        key: keys.left,
        downCallback: () => (this.xSpeed = -playerSpeed),
        upCallback: () => (this.xSpeed = 0)
      },
      right: {
        key: keys.right,
        downCallback: () => (this.xSpeed = playerSpeed),
        upCallback: () => (this.xSpeed = 0)
      }
    })

    document.addEventListener('keydown', e => {
      if (e.key === keys.jump) {
        this.jump()
      }
    })
  }

  activate = () => {
    this.active = true
  }

  deactivate = () => {
    this.active = false
  }

  reset = () => {
    this.active = true
    this.jumpAvailable = true
    this.isGrounded = true
    this.isKnockedBack = false
    this.position.x = this.startingPos.x
    this.position.y = this.startingPos.y
  }

  scorePoint = () => {
    this.score++
    this.scoreText.setScore(this.score)
  }

  private bringToFront = () => {
    this.parent.setChildIndex(this, this.parent.children.length - 1)
  }

  private jump = () => {
    if (this.isKnockedBack || !this.isGrounded || !this.jumpAvailable) return
    this.jumpAvailable = false
    this.bringToFront()
    const targetGlobalPosition = this.target.getGlobalPosition()
    const targetPosition = {
      x: targetGlobalPosition.x - this.parent.position.x,
      y: targetGlobalPosition.y - this.parent.position.y
    }
    this.isGrounded = false
    Promise.all([
      moveTo(this, jumpDuration, {
        x: targetPosition.x,
        y: targetPosition.y,
        ease: Linear.easeNone
      }),
      grow(this, 1.5, jumpDuration / 2, Circ.easeOut).then(() =>
        grow(this, 1, jumpDuration / 2, Circ.easeIn)
      )
    ]).then(this.land)
  }

  private land = () => {
    this.isGrounded = true
    this.handleGroundPound(this)
    shake(this.parent, 3)
    this.parent.addChildAt(this.poundEffect, 0)
    this.poundEffect.play({ x: this.x, y: this.y })

    this.refillJumpAvailability()
  }

  refillJumpAvailability = () => {
    this.greySprite.visible = true
    this.cooldownIndicator.fillUp(jumpCooldownTime).then(() => {
      this.greySprite.visible = false
      this.jumpAvailable = true
    })
  }

  isMoving = () => this.xSpeed !== 0 || this.ySpeed !== 0

  pushBack = (strength: number) => {
    if (this.isKnockedBack) return
    this.isKnockedBack = true

    this.isGrounded = true

    const x = -strength * Math.cos(this.rotation) + this.x
    const y = -strength * Math.sin(this.rotation) + this.y

    moveTo(this, knockBackDuration, {
      x,
      y
    }).then(() => (this.isKnockedBack = false))
    if (!this.jumpAvailable) this.refillJumpAvailability()
  }

  private addCursors = (cursors: Cursors) => {
    document.addEventListener('keydown', e => {
      Object.keys(cursors).forEach((cursorKey: string) => {
        if (e.key === cursors[cursorKey].key) {
          e.preventDefault()
          cursors[cursorKey].downCallback(e)
        }
      })
    })
    document.addEventListener('keyup', e => {
      Object.keys(cursors).forEach((cursorKey: string) => {
        if (e.key === cursors[cursorKey].key) {
          cursors[cursorKey].upCallback(e)
        }
      })
    })
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

  prevPos: Point
  update = (delta: number, opponent: Player) => {
    if (!this.active || this.isKnockedBack || !this.isGrounded) return

    this.prevPos = { x: this.position.x, y: this.position.y }

    this.lookAt(opponent.x, opponent.y)

    this.normalizeSpeed()

    this.position.x += this.xSpeed * delta
    this.position.y += this.ySpeed * delta

    if (distanceBetween(this.prevPos, this.position) > 0)
      console.log(distanceBetween(this.prevPos, this.position))
  }
}

export default Player
