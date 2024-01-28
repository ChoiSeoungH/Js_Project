import LoadingScene from "./scenes/LoadingScene";
import MainScene from "./scenes/MainScene";
import PlayingScene from "./scenes/PlayingScene";
import GameOverScene from "./scenes/GameOverScene";
import GameClearScene from "./scenes/GameClearScene";

const Config = {
    // 게임 화면의 크기와 색을 설정
    width: 800,
    height: 600,
    backgroundColor: 0x000000,

    // 사용할 scene
    scene: [LoadingScene, MainScene, PlayingScene, GameOverScene, GameClearScene],

    pixelArt: true,

    physics: {
        default: "arcade",
        arcade: {
            debug: process.env.DEBUG === "true",
        },
    },
};

export default Config;