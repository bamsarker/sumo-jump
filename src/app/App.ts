import * as PIXI from 'pixi.js'
import {
  circleRadius,
  gameWidth,
  backgroundColor,
  gameHeight,
  circleColors,
  poundRadius,
  arenaRadius,
  randomArenaPosition
} from '../config'
import Player from './Player'
import Arena from './Arena'
import { distanceBetween } from '../utils'
import { ScoreText } from './ScoreText'

import sumo from '../assets/images/sumo/*.png'
import Enemy from './Enemy'

export class GameApp {
  private app: PIXI.Application
  arena: Arena
  players: Player[]
  enemies: Enemy[]
  lastEnemySpawnTime: number

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
    this.enemies = []
    this.lastEnemySpawnTime = 0

    let loader = new PIXI.Loader()

    Object.keys(sumo).forEach(key => {
      loader.add(key, sumo[key])
    })

    loader.load(this.onAssetsLoaded)
  }

  private addEnemy = () => {
    const enemy = new Enemy({
      x: randomArenaPosition(),
      y: randomArenaPosition(),
      sprite: 'enemy'
    })
    this.enemies.push(enemy)
    enemy.activate()
    this.arena.addChild(enemy)
  }

  private addPlayer = ({
    x,
    y,
    color,
    keys,
    handleGroundPound,
    scoreText,
    sprite
  }) => {
    const player = new Player({
      x,
      y,
      color,
      keys,
      handleGroundPound,
      scoreText,
      sprite
    })
    this.players.push(player)
    player.activate()
    this.arena.addChild(player)
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
      y: gameHeight - gameHeight * 0.2,
      bgColor: circleColors[1]
    })
    this.app.stage.addChild(scoreText1)

    this.addEnemy()

    this.addPlayer({
      x: 0,
      y: arenaRadius * -0.6,
      color: circleColors[0],
      keys: {
        up: 'ArrowUp',
        down: 'ArrowDown',
        left: 'ArrowLeft',
        right: 'ArrowRight',
        jump: 'm'
      },
      handleGroundPound: this.handleGroundPound,
      scoreText: scoreText0,
      sprite: 'sumo_01'
    })
    // this.addPlayer({
    //   x: 0,
    //   y: arenaRadius * 0.6,
    //   color: circleColors[1],
    //   keys: {
    //     up: 'w',
    //     down: 's',
    //     left: 'a',
    //     right: 'd',
    //     jump: 'c'
    //   },
    //   handleGroundPound: this.handleGroundPound,
    //   scoreText: scoreText1,
    //   sprite: 'sumo_02'
    // })

    this.app.ticker.add(this.update)
  }

  private handleGroundPound = (pounder: Player) => {
    console.log('handle ground pound')
    ;[...this.enemies, ...this.players.filter(p => p !== pounder)].forEach(
      enemy => {
        const dist = distanceBetween(pounder.position, enemy.position)
        if (dist < poundRadius) {
          enemy.pushBack((poundRadius - dist) * 2, true)
        }
      }
    )
  }

  isCollided = (objA, objB) => {
    const dist = distanceBetween(objA.position, objB.position)
    return dist < objA.radius + objB.radius
  }

  private collisionChecks = () => {
    const p0 = this.players[0]
    // const p1 = this.players[1]
    this.enemies.forEach(enemy => {
      if (p0.isGrounded && this.isCollided(p0, enemy)) {
        const dist = distanceBetween(p0.position, enemy.position)

        // p.pushBack(p0.isGrounded ? dist / 2 : 100)
        enemy.pushBack(50)
      }
    })
  }

  private update = (delta: number) => {
    this.players.forEach(player => {
      player.update(
        delta,
        this.players.find(p => p !== player)
      )
    })

    this.lastEnemySpawnTime += delta
    if (this.lastEnemySpawnTime > 100) {
      this.addEnemy()
      this.lastEnemySpawnTime = 0
    }
    this.enemies = this.enemies.filter(e => e.active)
    this.enemies.forEach(enemy => {
      enemy.update(delta, this.players[0])
    })

    this.collisionChecks()

    this.arena.checkBounds(this.players, this.enemies)
  }
}
