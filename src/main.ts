import { GameApp } from './app/App'
import { gameWidth, gameHeight } from './config'

const loadGame = () => {
  const myGame = new GameApp(document.body, gameWidth, gameHeight, loadGame)
}

loadGame()
