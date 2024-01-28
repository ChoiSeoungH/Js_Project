import Config from "../Config";

export function setBackground(scene, backgroundTexture) {
    // CSS의 background-repeat: repeat
    scene.m_background = scene.add.tileSprite(
        0,
        0,
        Config.width,
        Config.height,
        backgroundTexture
    ).setOrigin(0, 0);
}