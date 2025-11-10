import { type TrainPosition } from "./trainPosition";
import { TrainTemplate } from "./trainTemplate";
import type { Track } from "./track";
import SimulationEvent from "../utils/event";

enum AccelerationStatus {
    Accelerating,
    Decelerating,
    Constant,
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

    constructor(track: Track, trainTemplate: TrainTemplate) {
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

    step() {
        // TODO: implement train movement logic @jakseluz
        // updating position based on velocity and acceleration
        // updating velocity based on acceleration
        // checking if the train reached its next station
        // handle taken track at the station
    }

    stop() {
        this.#velocity = 0;
        this.#acceleration = 0;
    }

    displayName(): string {
        return this.trainTemplate.displayName();
    }

    get number() {
        return this.trainTemplate.number;
    }
    get type() {
        return this.trainTemplate.type;
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
