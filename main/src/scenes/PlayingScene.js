import Phaser from "phaser";
import Config from "../Config";
import Mob from "../characters/Mob";
import Player from "../characters/Player";
import ExpBar from "../ui/ExpBar";
import TopBar from "../ui/TopBar";
import {
    addAttackEvent,
    setAttackDamage,
    setAttackScale
} from "../utils/attackManager";
import {
    setBackground
} from "../utils/backgroundManager";
import {
    addMob,
    addMobEvent,
    removeOldestMobEvent
} from "../utils/mobManager";
import {
    pause
} from "../utils/pauseManager";
import {
    createTime
} from "../utils/time";

export default class PlayingScene extends Phaser.Scene {
    constructor() {
        super("playGame");
    }

    create() {
        this.sound.pauseOnBlur = false;
        this.m_beamSound = this.sound.add("audio_beam");
        this.m_scratchSound = this.sound.add("audio_scratch");
        this.m_hitMobSound = this.sound.add("audio_hitMob");
        this.m_growlSound = this.sound.add("audio_growl");
        this.m_explosionSound = this.sound.add("audio_explosion");
        this.m_expUpSound = this.sound.add("audio_expUp");
        this.m_hurtSound = this.sound.add("audio_hurt");
        this.m_nextLevelSound = this.sound.add("audio_nextLevel");
        this.m_gameOverSound = this.sound.add("audio_gameOver");
        this.m_gameClearSound = this.sound.add("audio_gameClear");
        this.m_pauseInSound = this.sound.add("audio_pauseIn");
        this.m_pauseOutSound = this.sound.add("audio_pauseOut");


        this.m_player = new Player(this);

        this.cameras.main.startFollow(this.m_player);

        setBackground(this, "background1");

        this.m_cursorKeys = this.input.keyboard.createCursorKeys();

        // Mob
        this.m_mobs = this.physics.add.group();
        this.m_mobs.add(new Mob(this, 0, 0, "mob1", "mob1_anim", 10));
        this.m_mobEvents = [];

        addMobEvent(this, 1000, "mob1", "mob1_anim", 10, 0.9);

        // Attack
        this.m_weaponDynamic = this.add.group();
        this.m_weaponStatic = this.add.group();
        this.m_attackEvents = {};

        addAttackEvent(this, "claw", 10, 2.3, 1500);


        // Player와 mob이 부딪혔을 경우 player에 데미지 10
        this.physics.add.overlap(
            this.m_player,
            this.m_mobs,
            () => this.m_player.hitByMob(10),
            null,
            this
        );

        // mob -> dynamic 
        this.physics.add.overlap(
            this.m_weaponDynamic,
            this.m_mobs,
            (weapon, mob) => {
                mob.hitByDynamic(weapon, weapon.m_damage);
            },
            null,
            this
        );

        // mob -> static 
        this.physics.add.overlap(
            this.m_weaponStatic,
            this.m_mobs,
            (weapon, mob) => {
                mob.hitByStatic(weapon.m_damage);
            },
            null,
            this
        );

        // item
        this.m_expUps = this.physics.add.group();
        this.physics.add.overlap(
            this.m_player,
            this.m_expUps,
            this.pickExpUp,
            null,
            this
        );

        // topbar, expbar
        this.m_topBar = new TopBar(this);
        this.m_expBar = new ExpBar(this, 50);

        // ESC 키를 누르면 "pause" 
        this.input.keyboard.on(
            "keydown-ESC",
            () => {
                pause(this, "pause");
            },
            this
        );

        // time
        createTime(this);
    }

    update() {
        this.movePlayerManager();

        this.m_background.setX(this.m_player.x - Config.width / 2);
        this.m_background.setY(this.m_player.y - Config.height / 2);

        this.m_background.tilePositionX = this.m_player.x - Config.width / 2;
        this.m_background.tilePositionY = this.m_player.y - Config.width / 2;

        const closest = this.physics.closest(
            this.m_player,
            this.m_mobs.getChildren()
        );
        this.m_closest = closest;
    }

    pickExpUp(player, expUp) {
        expUp.disableBody(true, true);
        expUp.destroy();

        this.m_expUpSound.play();

        this.m_expBar.increase(expUp.m_exp);
        if (this.m_expBar.m_currentExp >= this.m_expBar.m_maxExp) {
            pause(this, "levelup");
        }
    }

    afterLevelUp() {
        this.m_topBar.gainLevel();

        switch (this.m_topBar.m_level) {
            case 2:
                removeOldestMobEvent(this);
                addMobEvent(this, 1000, "mob2", "mob2_anim", 20, 0.8);
                // claw 공격 크기 확대
                setAttackScale(this, "claw", 4);
                break;
            case 3:
                removeOldestMobEvent(this);
                addMobEvent(this, 1000, "mob3", "mob3_anim", 30, 0.7);
                // catnip 공격 추가
                addAttackEvent(this, "catnip", 10, 2);
                break;
            case 4:
                removeOldestMobEvent(this);
                addMobEvent(this, 1000, "mob4", "mob4_anim", 40, 0.7);
                // catnip 공격 크기 확대
                setAttackScale(this, "catnip", 3);
                setBackground(this, "background3");
                break;
            case 5:
                // beam 공격 추가
                addAttackEvent(this, "beam", 10, 1, 1000);
                break;
            case 6:
                // beam 공격 크기 및 데미지 확대
                setAttackScale(this, "beam", 2);
                setAttackDamage(this, "beam", 40);
                break;
            case 7:
                addMob(this, "lion", "lion_anim", 200, 0);
                setBackground(this, "background3");
                break;
        }
    }


    movePlayerManager() {
        if (this.m_cursorKeys.left.isDown || this.m_cursorKeys.right.isDown || this.m_cursorKeys.up.isDown || this.m_cursorKeys.down.isDown) {
            if (!this.m_player.m_moving) {
                this.m_player.play("player_anim");
            }
            this.m_player.m_moving = true;
        } else {
            if (this.m_player.m_moving) {
                this.m_player.play("player_idle");
            }
            this.m_player.m_moving = false;
        }

        let vector = [0, 0];
        if (this.m_cursorKeys.left.isDown) {
            vector[0] += -1;
        } else if (this.m_cursorKeys.right.isDown) {
            vector[0] += 1;
        }

        if (this.m_cursorKeys.up.isDown) {
            vector[1] += -1;
        } else if (this.m_cursorKeys.down.isDown) {
            vector[1] += 1;
        }

        this.m_player.move(vector);

        // static 공격 이동
        this.m_weaponStatic.children.each(weapon => {
            weapon.move(vector);
        }, this);
    }

}