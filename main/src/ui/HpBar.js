import Phaser from "phaser";
import {
    clamp
} from "../utils/math";

export default class HpBar extends Phaser.GameObjects.Graphics {

    constructor(scene, player, maxHp) {
        super(scene);

        this.WIDTH = 80;
        this.HEIGHT = 12;
        this.BORDER = 2;

        this.m_x = player.x - this.WIDTH / 2;
        this.m_y = player.y + 40;

        this.m_maxHp = maxHp;
        this.m_currentHp = maxHp;
        this.draw();
        this.setScrollFactor(0);
        this.setDepth(20);

        scene.add.existing(this);
    }

    increase(amount) {
        this.m_currentHp = clamp(this.m_currentHp + amount, 0, this.m_maxHp);
        this.draw();
    }

    decrease(amount) {
        this.m_currentHp = clamp(this.m_currentHp - amount, 0, this.m_maxHp);
        this.draw();
    }

    draw() {
        this.clear();

        // HP bar의 검은색 사각형
        this.fillStyle(0x000000);
        this.fillRect(this.m_x, this.m_y, this.WIDTH, this.HEIGHT);

        // HP bar의 흰 HP 배경
        // 위에서 그린 검은색 사각형에서 상하좌우로 border만큼 안쪽으로 줄어든 사각형
        this.fillStyle(0xffffff);
        this.fillRect(
            this.m_x + this.BORDER,
            this.m_y + this.BORDER,
            this.WIDTH - 2 * this.BORDER,
            this.HEIGHT - 2 * this.BORDER
        );

        if (this.m_currentHp < 30) {
            this.fillStyle(0xff0000); //빨강
        } else {
            this.fillStyle(0x00ff00); //초록
        }

        let d = Math.floor(
            ((this.WIDTH - 2 * this.BORDER) / this.m_maxHp) * this.m_currentHp
        );
        this.fillRect(
            this.m_x + this.BORDER,
            this.m_y + this.BORDER,
            d,
            this.HEIGHT - 2 * this.BORDER
        );
    }
}