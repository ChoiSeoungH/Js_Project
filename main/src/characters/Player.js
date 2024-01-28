import Phaser from "phaser";
import Config from "../Config";
import HpBar from "../ui/HpBar";
import { loseGame } from "../utils/sceneManager";

export default class Player extends Phaser.Physics.Arcade.Sprite {
    constructor(scene) {
        
        super(scene, Config.width / 2, Config.height / 2, "player");
        scene.add.existing(this);
        scene.physics.add.existing(this);

        // 크기를 조절
        this.scale = 2;

        // CSS의 z-index
        this.setDepth(20);

        this.setBodySize(24, 28);

        this.m_moving = false;

        // 공격받은 후 쿨타임
        this.m_canBeAttacked = true;

        // scene, player, maxHp
        this.m_hpBar = new HpBar(scene, this, 100);
    }

    move(vector) {
        let PLAYER_SPEED = 3;

        this.x += vector[0] * PLAYER_SPEED;
        this.y += vector[1] * PLAYER_SPEED;

        if (vector[0] === -1) this.flipX = false;
        else if (vector[0] === 1) this.flipX = true;
    }

    hitByMob(damage) {
        // 쿨타임이었던 경우 공격받지 않음
        if (!this.m_canBeAttacked) return;

        this.scene.m_hurtSound.play();

        this.getCooldown();

        this.m_hpBar.decrease(damage);

        if (this.m_hpBar.m_currentHp <= 0) {
            loseGame(this.scene);
        }
    }

    getCooldown() {
        this.m_canBeAttacked = false;
        this.alpha = 0.5;
        this.scene.time.addEvent({
            delay: 1000,
            callback: () => {
                this.alpha = 1;
                this.m_canBeAttacked = true;
            },
            callbackScope: this,
            loop: false,
        });
    }
}