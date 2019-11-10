import * as PIXI from 'pixi.js'
import {
  circleRadius,
  gameWidth,
  backgroundColor,
  gameHeight,
  circleColors,
  poundRadius,
  scoreTextStyle
} from '../config'
import Player from './Player'
import Arena from './Arena'
import { distanceBetween } from '../utils'
import { ScoreText } from './ScoreText'

export class GameApp {
  private app: PIXI.Application
  arena: Arena
  players: Player[]

  constructor(
    parent: HTMLElement,
    width: number,
    height: number,
    replay: () => void
  ) {
    this.app = new PIXI.Application({
      width,
      height,
      backgroundColor: backgroundColor,
      antialias: true
    })
    parent.replaceChild(this.app.view, parent.lastElementChild) // Hack for parcel HMR

    this.players = []

    let loader = new PIXI.Loader()

    loader.load(this.onAssetsLoaded)
  }

  private addPlayer = ({ x, y, color, keys, handleGroundPound, scoreText }) => {
    const player = new Player({
      x,
      y,
      color,
      keys,
      handleGroundPound,
      scoreText
    })
    this.players.push(player)
    player.activate()
    this.app.stage.addChild(player)
  }

  private addArena = () => {
    const arena = new Arena({
      x: gameWidth / 2,
      y: gameHeight / 2
    })
    this.arena = arena
    this.app.stage.addChild(this.arena)
  }

  private gameOver = () => {
    console.log('GAME OVER')
  }

  private onAssetsLoaded = () => {
    this.addArena()

    const scoreText0 = new ScoreText({
      x: gameWidth * 0.12,
      y: gameHeight * 0.2,
      bgColor: circleColors[0]
    })
    this.app.stage.addChild(scoreText0)

    const scoreText1 = new ScoreText({
      x: gameWidth - gameWidth * 0.12,
      y: gameHeight * 0.2,
      bgColor: circleColors[1]
    })
    this.app.stage.addChild(scoreText1)

    this.addPlayer({
      x: gameWidth / 2,
      y: gameHeight * 0.25,
      color: circleColors[0],
      keys: {
        up: 'ArrowUp',
        down: 'ArrowDown',
        left: 'ArrowLeft',
        right: 'ArrowRight',
        jump: 'm'
      },
      handleGroundPound: this.handleGroundPound,
      scoreText: scoreText0
    })
    this.addPlayer({
      x: gameWidth / 2,
      y: gameHeight * 0.75,
      color: circleColors[1],
      keys: {
        up: 'w',
        down: 's',
        left: 'a',
        right: 'd',
        jump: 'c'
      },
      handleGroundPound: this.handleGroundPound,
      scoreText: scoreText1
    })

    this.app.ticker.add(this.update)
  }

  private handleGroundPound = (pounder: Player) => {
    const opponent = this.players.find(p => p !== pounder)
    const dist = distanceBetween(pounder.position, opponent.position)
    if (dist < poundRadius) {
      opponent.pushBack((poundRadius - dist) * 1.5)
    }
  }

  private collisionChecks = () => {
    const p0 = this.players[0]
    const p1 = this.players[1]
    const dist = distanceBetween(p0.position, p1.position)
    if (dist < circleRadius * 2) {
      if (p0.isMoving() && p1.isGrounded) {
        p0.pushBack(dist / 2)
        p1.pushBack(dist / 2)
      }
      if (p1.isMoving() && p0.isGrounded) {
        p0.pushBack(dist / 2)
        p1.pushBack(dist / 2)
      }
    }
  }

  private update = (delta: number) => {
    this.players.forEach(player => {
      player.update(delta, this.players.find(p => p !== player))
    })

    this.collisionChecks()

    this.arena.checkBounds(this.players)
  }
}
