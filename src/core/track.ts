import { Station } from "./station";
import { Train } from "./train";
import { Position } from "../utils/position";
import { simulation } from "./simulation";
import type { Time } from "../utils/time";

/**
 * For representation of each platform Track at the station
 */
export class Track {
    /** The station to which this track belongs */
    #station: Station;
    /** Platform "number" */
    #platformNumber: number;
    /** Track "number" within the platform, may have some letters in it */
    #trackNumber: string;
    /** A train currently present on the platform track */
    #currentTrain: Train | null;
    /** Whether the track is hidden in the UI */
    #isHidden: boolean = false;

    constructor(station: Station, platformNumber: number, trackNumber: string, isHidden: boolean = false) {
        this.#station = station;
        this.#platformNumber = platformNumber;
        this.#trackNumber = trackNumber;
        this.#currentTrain = null;
        this.#isHidden = isHidden;
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
            }
            // Update the delay value used in the UI
            this.#currentTrain.delay.UIDelayValue = this.station.currentExceedingTimeInSeconds(
                this.#currentTrain,
                false
            );
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
    get isHidden() {
        return this.#isHidden;
    }
}
