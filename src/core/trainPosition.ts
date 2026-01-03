import type { Rail } from "./rail";
import { Position } from "../utils/position";
import type { Track } from "./track";
import type { Station } from "./station";

export enum TrainDirection {
    FromStartToEnd,
    FromEndToStart,
}
export type TrainPosition = Track | TrainPositionOnRail;
/**
 * For representation of each Train Position on the way
 */
export class TrainPositionOnRail {
    /** Distance from the start of the rail to the current position */
    #distance: number;
    /** The rail on which the train is currently positioned */
    #rail: Rail;
    /** The direction in which the train is moving on the rail - either from start to end or from end to start ({@link TrainDirection}) */
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

    getTargetStation(): Station {
        if (this.#direction === TrainDirection.FromStartToEnd) {
            return this.#rail.toStation;
        } else {
            return this.#rail.fromStation;
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
