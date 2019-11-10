import * as PIXI from 'pixi.js'
import {
  randomYPos,
  randomXPos,
  randomCircleColor,
  topLimit,
  bottomLimit,
  circleRadius,
  gameWidth,
  backgroundColor,
  obstacleSpeedModifier,
  baseObstacleSpeed,
  lineColor,
  lineHeight,
  randomPlayerColor,
  colorNameMap,
  gameHeight,
  circleColors
} from '../config'
import Player from './Player'
import Arena from './Arena'
import { distanceBetween } from '../utils'

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

  private addPlayer = ({ x, y, color, keys, handleGroundPound }) => {
    const player = new Player({
      x,
      y,
      color,
      keys,
      handleGroundPound
    })
    this.players.push(player)
    this.app.stage.addChild(player)
  }

  private addArena = () => {
    const arena = new Arena({
      x: gameWidth / 2,
      y: gameHeight / 2,
      color: 0xcca600
    })
    this.arena = arena
    this.app.stage.addChild(this.arena)
  }

  private gameOver = () => {
    console.log('GAME OVER')
  }

  private onAssetsLoaded = () => {
    this.addArena()
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
      handleGroundPound: this.handleGroundPound
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
      handleGroundPound: this.handleGroundPound
    })
    this.app.ticker.add(this.update)
  }

  private handleGroundPound = (pounder: Player) => {
    const opponent = this.players.find(p => p !== pounder)
    const dist = distanceBetween(pounder.position, opponent.position)
    if (dist < 150) {
      opponent.pushBack(150 - dist, pounder.position)
    }
  }

  private update = (delta: number) => {
    this.players.forEach(player => {
      player.update(delta, this.players.find(p => p !== player))
    })
  }
}
