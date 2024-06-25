import {Component, Property} from '@wonderlandengine/api';
import {Ball} from './ball';
import {vec3, quat} from 'gl-matrix';

const tempVec = vec3.create();
const tempRot = quat.create();

/**
 * player
 */
export class Player extends Component {
    static TypeName = 'player';

    /* Properties that are configurable in the editor */
    static Properties = {
        playerTeleportLoc: Property.object(),
        ball: Property.object(),
    };

    start() {
        this.engine.onXRSessionStart.add(() => {
            this.engine.xr.session.addEventListener(
                'selectstart',
                this.selectPressed.bind(this)
            );
        });
    }

    selectPressed() {
        if (this.ball.getComponent(Ball).isStill()) {
            this.playerTeleportLoc.getPositionWorld(tempVec);
            this.object.setPositionWorld(tempVec);

            this.playerTeleportLoc.getRotationWorld(tempRot);
            this.object.setRotationWorld(tempRot);
        }
    }
}
