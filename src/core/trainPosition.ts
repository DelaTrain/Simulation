import type { Rail } from "./rail";
import { Position } from "../utils/position";
import type { Track } from "./track";

export enum TrainDirection {
    FromStartToEnd,
    FromEndToStart,
}
export type TrainPosition = Track | TrainPositionOnRail;
/**
 * For representation of each Train Position on the way
 */
export class TrainPositionOnRail {
    // maybe export should be here also
    /** from start to the next station */
    #distance: number;
    /**  */
    #rail: Rail;
    #direction: TrainDirection;

    constructor(rail: Rail, direction: TrainDirection = TrainDirection.FromStartToEnd, distance: number = 0) {
        this.#distance = distance;
        this.#rail = rail;
        this.#direction = direction;
    }

    getPosition(): Position {
        if (this.#direction === TrainDirection.FromStartToEnd) {
            return this.#rail.findPositionAtDistance(this.#distance);
        } else {
            return this.#rail.findPositionAtDistance(this.#rail.length() - this.#distance);
        }
    }

    getDistanceToNextStation(): number {
        if (this.#direction === TrainDirection.FromStartToEnd) {
            return this.#rail.length() - this.#distance;
        } else {
            return this.#distance;
        }
    }

    move(distanceDelta: number) {
        this.#distance += distanceDelta;
    }

    set distance(newDistance: number) {
        this.#distance = newDistance;
    }

    get distance() {
        return this.#distance;
    }
    get rail() {
        return this.#rail;
    }
}
