import {Component, Property, CollisionEventType} from '@wonderlandengine/api';
import {vec3} from 'gl-matrix';

const tempVec = vec3.create();

/**
 * ball
 */
export class Ball extends Component {
    static TypeName = 'ball';
    /* Properties that are configurable in the editor */
    static Properties = {
        holeInsideLoc: Property.object(),
        endPanel: Property.object(),
        endPanelLoc: Property.object(),
        endPanelHitsText: Property.object(),
        star1: Property.object(),
        star2: Property.object(),
        star3: Property.object(),
    };

    init() {
        /* Last location the ball came to rest at */
        this.lastBallStaticLoc = vec3.create();
        this.currentLoc = vec3.create();

        this.hitCount = 0;
        this.hitGate = true;

        this.lerpTime = 100;
        this.endLoc = vec3.create();
    }

    start() {
        /* Initialize stars */
        this.star1.getComponent('mesh').active = false;
        this.star2.getComponent('mesh').active = false;
        this.star3.getComponent('mesh').active = false;

        /* Physx collision */
        this.rigidBody = this.object.getComponent('physx');
        this.rigidBody.onCollision((type, other) => {
            /* Ignore onCollision end events */
            if (type === CollisionEventType.TouchLost) return;

            /* onCollision begin event */
            if (type === CollisionEventType.Touch) {
                this.onCollisionBegin(other);
            }
        });

        /* Lerp */
        this.holeInsideLoc.getPositionWorld(this.endLoc);
    }

    update(dt) {
        /* When the ball hits the hole, lerp into it */
        if (this.lerpTime < 0.5) {
            this.lerpTime += dt;

            const lerpRatio = this.lerpTime / 0.5;
            this.object.getPositionWorld(this.currentLoc);
            vec3.lerp(tempVec, this.currentLoc, this.endLoc, lerpRatio);
            this.object.setPositionWorld(tempVec);
        }

        if (this.isStill()) {
            this.object.getPositionWorld(this.lastBallStaticLoc);
        }
    }

    /* Whether the ball has come to rest */
    isStill() {
        if (
            this.rigidBody.linearVelocity[0] == 0 &&
            this.rigidBody.linearVelocity[1] == 0 &&
            this.rigidBody.linearVelocity[2] == 0
        ) {
            return true;
        } else {
            return false;
        }
    }

    onCollisionBegin(other) {
        /** [Collision with hole] **/

        if (other.object.name === 'Hole') {
            /* Goal hole */
            console.log('Goal!');
            this.rigidBody.kinematic = true; /* To enable physx movement */
            this.lerpTime = 0; /* Start lerp */

            /* End panel */
            this.endPanel.setPositionWorld(this.endPanelLoc.getPositionWorld());
            this.endPanelHitsText.getComponent('text').text = `Hits: ${this.hitCount}`;

            /* Participation trophy */
            this.star1.getComponent('mesh').active = true;
            /* Did ok */
            this.star2.getComponent('mesh').active = this.hitCount <= 6;
            /* Did well! */
            this.star3.getComponent('mesh').active = this.hitCount <= 3;
        }

        /** [Collision with Boundries] **/
        if (other.object.name === 'Boundaries_Physx') {
            /* Respawn the ball */
            console.log('touch');
            console.log(this.lastBallStaticLoc);
            this.rigidBody.kinematic = true; /* To enable physx movement */
            this.object.setPositionWorld(this.lastBallStaticLoc);
            /* To enable physx movement, after delay */
            setTimeout(() => (this.rigidBody.kinematic = false), 100);
        }

        /** [Collision with GolfClub] **/
        if (other.object.name === 'GolfClub' && this.hitGate) {
            this.hitCount += 1;

            this.hitGate = false;
            /* Open hitGate again after a 1 second delay,
             * to not count more than 1 hit by accident */
            setTimeout(() => (this.hitGate = true), 1000);

            console.log(this.hitCount);
        }
    }
}
