import {Component, InputComponent, MeshComponent, Property} from '@wonderlandengine/api';
import {CursorTarget, HowlerAudioSource} from '@wonderlandengine/components';

/**
 * Helper function to trigger haptic feedback pulse.
 *
 * @param {Object} object An object with 'input' component attached
 * @param {number} strength Strength from 0.0 - 1.0
 * @param {number} duration Duration in milliseconds
 */
export function hapticFeedback(object, strength, duration) {
    const input = object.getComponent(InputComponent);
    if (input && input.xrInputSource) {
        const gamepad = input.xrInputSource.gamepad;
        if (gamepad && gamepad.hapticActuators)
            gamepad.hapticActuators[0].pulse(strength, duration);
    }
}

/**
 * Button component.
 *
 * Shows a 'hoverMaterial' on cursor hover, moves backward on cursor down,
 * returns to its position on cursor up, plays click/unclick sounds and haptic
 * feedback on hover.
 *
 * Use `target.onClick.add(() => {})` on the `cursor-target` component used
 * with the button to define the button's action.
 *
 * Supports interaction with `finger-cursor` component for hand tracking.
 */
export class ButtonComponent extends Component {
    static TypeName = 'button';
    static Properties = {
        /** Object that has the button's mesh attached */
        buttonMeshObject: Property.object(),
        /** Material to apply when the user hovers the button */
        hoverMaterial: Property.material(),
        player: Property.object(),
        ball: Property.object(),
        star1: Property.object(),
        star2: Property.object(),
        star3: Property.object(),
    };

    static onRegister(engine) {
        engine.registerComponent(HowlerAudioSource);
        engine.registerComponent(CursorTarget);
    }

    /* Position to return to when "unpressing" the button */
    returnPos = new Float32Array(3);

    start() {
        this.mesh = this.buttonMeshObject.getComponent(MeshComponent);
        this.defaultMaterial = this.mesh.material;
        this.buttonMeshObject.getTranslationLocal(this.returnPos);

        this.target =
            this.object.getComponent(CursorTarget) ||
            this.object.addComponent(CursorTarget);

        this.soundClick = this.object.addComponent(HowlerAudioSource, {
            src: 'sfx/click.wav',
            spatial: true,
        });
        this.soundUnClick = this.object.addComponent(HowlerAudioSource, {
            src: 'sfx/unclick.wav',
            spatial: true,
        });

        /* Set startLocations */
        this.playerStartLoc = this.player.getPositionWorld();
        this.ballStartLoc = this.ball.getPositionWorld();
        this.ballStartRot = this.ball.getRotationWorld();
        this.panelStartLoc = this.object.parent.getPositionWorld();
    }

    onActivate() {
        this.target.onHover.add(this.onHover);
        this.target.onUnhover.add(this.onUnhover);
        this.target.onDown.add(this.onDown);
        this.target.onUp.add(this.onUp);
    }

    onDeactivate() {
        this.target.onHover.remove(this.onHover);
        this.target.onUnhover.remove(this.onUnhover);
        this.target.onDown.remove(this.onDown);
        this.target.onUp.remove(this.onUp);
    }

    /* Called by 'cursor-target' */
    onHover = (_, cursor) => {
        this.mesh.material = this.hoverMaterial;
        if (cursor.type === 'finger-cursor') {
            this.onDown(_, cursor);
        }

        hapticFeedback(cursor.object, 0.5, 50);
    };

    /* Called by 'cursor-target' */
    onDown = (_, cursor) => {
        this.soundClick.play();
        this.buttonMeshObject.translate([0.0, -0.1, 0.0]);
        hapticFeedback(cursor.object, 1.0, 20);

        /* Restart */
        this.restart();
    };

    restart() {
        /* Reset Locations */
        this.player.setPositionWorld(this.playerStartLoc);
        this.ball.setPositionWorld(this.ballStartLoc);
        this.ball.setRotationWorld(this.ballStartRot);
        this.object.parent.setPositionWorld(this.panelStartLoc);

        /* Disable Stars Meshes */
        this.star1.getComponent('mesh').active = false;
        this.star2.getComponent('mesh').active = false;
        this.star3.getComponent('mesh').active = false;

        /* Reset Physx */
        setTimeout(
            () => (this.ball.getComponent('physx').kinematic = false),
            1000
        ); /* Set it with delay to not collide by mistake with hole */

        /* Reset HitNumbers */
        this.ball.getComponent('ball').hitsNumbers = 0;
    }

    /* Called by 'cursor-target' */
    onUp = (_, cursor) => {
        this.soundUnClick.play();
        this.buttonMeshObject.setTranslationLocal(this.returnPos);
        hapticFeedback(cursor.object, 0.7, 20);
    };

    /* Called by 'cursor-target' */
    onUnhover = (_, cursor) => {
        this.mesh.material = this.defaultMaterial;
        if (cursor.type === 'finger-cursor') {
            this.onUp(_, cursor);
        }

        hapticFeedback(cursor.object, 0.3, 50);
    };
}
