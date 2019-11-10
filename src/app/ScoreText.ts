import * as PIXI from 'pixi.js'

import { scoreTextStyle } from '../config'
import Circle from './Circle'

export class ScoreText extends PIXI.Container {
  displayText: PIXI.Text
  constructor({ x, y, bgColor }) {
    super()

    const bg = new Circle({
      x: 0,
      y: 0,
      color: bgColor,
      radius: 50
    })
    this.addChild(bg)

    this.displayText = new PIXI.Text('0', scoreTextStyle)
    this.displayText.anchor.x = 0.5
    this.displayText.anchor.y = 0.5
    this.addChild(this.displayText)

    this.position.x = x
    this.position.y = y
  }

  setScore = (score: number) => {
    this.displayText.text = `${score}`
  }
}
