import { type TrainPosition } from "./trainPosition";
import { TrainTemplate } from "./trainTemplate";
import type { Track } from "./track";


enum AccelerationStatus {
    Accelerating,
    Descelerating,
    Constant
}

/**
 * For representation of each Train in the simulation
 */
export class Train {
    trainTemplate: TrainTemplate;
    /** train speed value - meters per second */
    #velocity: number = 0;
    /** train acceleration value */
    #acceleration: AccelerationStatus = AccelerationStatus.Constant;
    /** contains distance and rail number */
    #position: TrainPosition;
    /** individual time of being late */
    #delay: number = 0;

    constructor(
        track: Track,
        trainTemplate: TrainTemplate
    ) {
        this.trainTemplate = trainTemplate;
        this.#position = track;
    }

    /**
     * Changes Train velocity
     * @param newVelocity updated velocity
     */
    updateVelocity(newVelocity: number) {
        this.#velocity = newVelocity;
    }

    /**
     * Changes Train acceleration
     * @param newAcceleration updated acceleration
     */
    updateAcceleration(newAcceleration: number) {
        this.#acceleration = newAcceleration;
    }


    stop() {
        this.#velocity = 0;
        this.#acceleration = 0;
    }



    get velocity() {
        return this.#velocity;
    }
    get acceleration() {
        return this.#acceleration;
    }
    get position() {
        return this.#position;
    }
    get delay() {
        return this.#delay;
    }
}
