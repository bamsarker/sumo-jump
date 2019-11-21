import { GameApp } from "./app/App";
import { gameWidth, gameHeight } from "./config";

const loadGame = () => {
  const myGame = new GameApp(document.body, gameWidth, gameHeight, loadGame);
};

if (document.fonts) document.fonts.ready.then(loadGame);
else loadGame();
