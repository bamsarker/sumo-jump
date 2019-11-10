import { Circle } from './Circle'
import { circleRadius, playerSpeed } from '../config'
import { moveTo, grow, shake } from './animations'
import { Linear, Circ } from 'gsap/TweenMax'
import { Cursors, Point } from '../interfaces'
import { ScoreText } from './ScoreText'
import PoundEffect from './PoundEffect'

export class Player extends Circle {
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
  constructor({ x, y, color, keys, handleGroundPound, scoreText }) {
    super({ x, y, color })

    this.startingPos = { x, y }
    this.poundEffect = new PoundEffect({ x, y, color, radius: circleRadius })
    this.xSpeed = 0
    this.ySpeed = 0
    this.score = 0
    this.scoreText = scoreText
    this.isGrounded = true
    this.isKnockedBack = false

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
    if (this.isKnockedBack || !this.isGrounded) return

    this.bringToFront()
    const targetGlobalPosition = this.target.getGlobalPosition()
    const targetPosition = {
      x: targetGlobalPosition.x - this.parent.position.x,
      y: targetGlobalPosition.y - this.parent.position.y
    }
    this.isGrounded = false
    Promise.all([
      moveTo(this, 0.5, {
        x: targetPosition.x,
        y: targetPosition.y,
        ease: Linear.easeNone
      }),
      grow(this, 1.5, 0.25, Circ.easeOut).then(() =>
        grow(this, 1, 0.25, Circ.easeIn)
      )
    ]).then(this.land)
  }

  private land = () => {
    this.isGrounded = true
    this.handleGroundPound(this)
    shake(this.parent, 3)
    this.parent.addChildAt(this.poundEffect, 0)
    this.poundEffect.play({ x: this.x, y: this.y })
  }

  isMoving = () => this.xSpeed !== 0 || this.ySpeed !== 0

  pushBack = (strength: number) => {
    this.isKnockedBack = true

    this.isGrounded = true

    const x = -strength * Math.cos(this.rotation) + this.x
    const y = -strength * Math.sin(this.rotation) + this.y

    moveTo(this, 0.5, {
      x,
      y
    }).then(() => (this.isKnockedBack = false))
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

  update = (delta: number, opponent: Player) => {
    if (!this.active || this.isKnockedBack || !this.isGrounded) return

    this.lookAt(opponent.x, opponent.y)

    this.position.x += this.xSpeed * delta
    this.position.y += this.ySpeed * delta
  }
}

export default Player
