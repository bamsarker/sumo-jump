import Circle from './app/Circle'

export const gameWidth = 900
export const gameHeight = 600

export const arenaRadius = (gameHeight - 50) / 2

export const powerUpMeterPosition = {
  x: gameWidth - 50,
  y: 60
}

export const poundRadius = 200

export const backgroundColor = 0x8d8682

export const circleColors = [0x2b59c3, 0xd36582]
export const circleAlpha = 0.7
export const randomCircleColor = () =>
  circleColors[Math.floor(Math.random() * circleColors.length)]
export const randomPlayerColor = (
  currentCircles: Circle[],
  circlesCreated: number
) => {
  // every 3 circles, give a color that exists
  if (currentCircles.length > 0 && circlesCreated % 3 === 0) {
    return currentCircles.map(c => c.color)[
      Math.floor(Math.random() * currentCircles.length)
    ]
  }
  // totally random
  return randomCircleColor()
}

export const baseObstacleSpeed = 3.25
export const obstacleSpeedModifier = 13

export const playerSpeed = 4

export const lineColor = 0xcccccc
export const lineHeight = 3
export const circleRadius = 40
export const topLimit = 165
export const height = 450
export const bottomLimit = gameHeight - circleRadius * 4
export const startingYPosition = bottomLimit + (gameHeight - bottomLimit) / 1.55
export const randomYPos = () => topLimit + Math.random() * height
export const randomXPos = () => 100 + Math.random() * 300

export const scoreTextStyle = {
  align: 'center',
  dropShadowAngle: 0,
  dropShadowBlur: 7,
  dropShadowDistance: 0,
  fill: ['white'],
  fontSize: 70,
  wordWrapWidth: 340,
  fontFamily: 'sans-serif',
  wordWrap: true
}
