import Phaser from "phaser";
import Player from "../characters/Player";

export default class Claw extends Phaser.Physics.Arcade.Sprite {

    constructor(scene, startingPosition, isHeadingRight, damage, scale) {
        super(scene, startingPosition[0], startingPosition[1], "claw_white");

        scene.add.existing(this);
        scene.physics.world.enableBody(this);
        scene.m_weaponStatic.add(this);
        scene.m_scratchSound.play({ volume: 0.5 });
        
        this.DURATION = 500;

        this.m_damage = damage;
        this.scale = scale;
        // 애니메이션을 재생합니다.
        this.play("scratch_white");
        if (!isHeadingRight) {
            this.flipX = true;
        }

        scene.time.addEvent({
            delay: this.DURATION,
            callback: () => {
                this.destroy();
            },
            loop: false,
        });
    }

    move(vector) {
        this.x += vector[0] * 3;
        this.y += vector[1] * 3;
    }
}