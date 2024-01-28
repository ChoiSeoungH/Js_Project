import Beam from "../effects/Beam";
import Claw from "../effects/Claw";
import Catnip from "../effects/Catnip";

export function addAttackEvent(scene, attackType, damage, scale, repeatGap = 0) {
    switch (attackType) {
        case "beam":
        case "claw":
            const timer = scene.time.addEvent({
                delay: repeatGap,
                callback: () => {
                    doAttackOneSet(scene, attackType, damage, scale);
                },
                loop: true,
            });
            scene.m_attackEvents[attackType] = { timer, damage, scale, repeatGap };
            break;
        case "catnip":
            const catnip = new Catnip(scene, [scene.m_player.x, scene.m_player.y + 20], damage, scale);
            scene.m_attackEvents[attackType] = { object: catnip, damage: damage };
            break;
    }
}

function doAttackOneSet(scene, attackType, damage, scale) {
    switch (attackType) {
        case "beam":
            new Beam(scene, [scene.m_player.x, scene.m_player.y - 16], damage, scale);
            break;
        case "claw":
            const isHeadingRight = scene.m_player.flipX;
            new Claw(scene,
                [scene.m_player.x - 60 + 120 * isHeadingRight, scene.m_player.y - 40],
                isHeadingRight,
                damage,
                scale);
            scene.time.addEvent({
                delay: 500,
                callback: () => {
                    new Claw(scene,
                        [scene.m_player.x - 60 + 120 * !isHeadingRight, scene.m_player.y - 40],
                        !isHeadingRight,
                        damage,
                        scale);
                },
                loop: false,
            });
            break;

        default:
            break;
    }
}

export function removeAttack(scene, attackType) {
    if (!scene.m_attackEvents[attackType]) return;

    // catnip의 경우 object를 제거
    if (attackType === "catnip") {
        scene.m_attackEvents[attackType].object.destroy();
        return;
    }

    // 다른 공격의 경우 설정했던 timer를 비활성화
    scene.time.removeEvent(scene.m_attackEvents[attackType].timer);
}

export function setAttackDamage(scene, attackType, newDamage) {
    const scale = scene.m_attackEvents[attackType].scale;
    const repeatGap = scene.m_attackEvents[attackType].repeatGap;
    removeAttack(scene, attackType);
    addAttackEvent(scene, attackType, newDamage, scale, repeatGap);
}

export function setAttackScale(scene, attackType, newScale) {
    const damage = scene.m_attackEvents[attackType].damage;
    const repeatGap = scene.m_attackEvents[attackType].repeatGap;
    removeAttack(scene, attackType);
    addAttackEvent(scene, attackType, damage, newScale, repeatGap);
}

export function setAttackRepeatGap(scene, attackType, newRepeatGap) {
    if (attackType === 'catnip') {
        console.error("Cannot set catnip's repeat gap");
        return;
    }

    const damage = scene.m_attackEvents[attackType].damage;
    const scale = scene.m_attackEvents[attackType].scale;
    removeAttack(scene, attackType);
    addAttackEvent(scene, attackType, damage, scale, newRepeatGap);
}