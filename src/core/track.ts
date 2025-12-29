import { Station } from "./station";
import { Train } from "./train";
import { Position } from "../utils/position";
import { simulation } from "./simulation";
import type { Time } from "../utils/time";

/**
 * For representation of each platform Track at the station
 */
export class Track {
    #station: Station;
    #platformNumber: number;
    /** track "number" within the platform may have some letters in it */
    #trackNumber: string;
    /** all Train units present on the platform track */
    #currentTrain: Train | null;

    constructor(station: Station, platformNumber: number, trackNumber: string) {
        this.#station = station;
        this.#platformNumber = platformNumber;
        this.#trackNumber = trackNumber;
        this.#currentTrain = null;
    }

    getPosition(): Position {
        return this.#station.position;
    }

    /**
     * Removes a specified train from the Track
     * @param train train to be removed from the Track
     * @returns deleted Train or null if there is no
     */
    trainDepart(): Train | null {
        const deleted = this.#currentTrain;
        this.#currentTrain = null;
        return deleted;
    }

    /**
     * Deals with train arrival on the Track, sets the actual arrival time and reduces delays
     * @param train arrived train
     * @param scheduleArrival scheduled arrival time
     * @returns false if the Track is full
     */
    trainArrival(train: Train, scheduleArrival: Time | null): boolean {
        if (this.#currentTrain == null) {
            this.#currentTrain = train;
            this.#currentTrain.delay.actualTrainArrival = simulation.currentTime;
            if (scheduleArrival) {
                this.#currentTrain.delay.reduceDelaysAtStations(scheduleArrival.toSeconds());
                // update the delay value used in the UI
                this.#currentTrain.delay.UIDelayValue = this.#currentTrain.delay.delayTimeInSeconds;
            }
            return true;
        } else {
            return false;
        }
    }

    get platformNumber() {
        return this.#platformNumber;
    }
    get trackNumber() {
        return this.#trackNumber;
    }
    get train() {
        return this.#currentTrain;
    }
    get station() {
        return this.#station;
    }
}
