import { simulation } from "../core/simulation";
import { Time } from "./time";

export class Delay {
    #actualTrainArrival: Time = new Time(0, 0, 0);

    #dWait: number = 0;
    #dConflict: number = 0;
    #dExternal: number = 0;

    /**
     * Adds external delay
     * @param dExternal delay time in seconds
     */
    addDelay(dExternal: number) {
        this.#dExternal += dExternal;
    }

    /**
     * Adds delay due to waiting for other Trains
     * @param dWait delay time in seconds
     */
    addWaitingDelay(dWait: number) {
        this.#dWait += dWait;
    }

    /**
     * Adds delay due to Station Track conflicts
     * @param dConflict delay time in seconds
     */
    addConflictDelay(dConflict: number) {
        this.#dConflict += dConflict;
    }

    set actualTrainArrival(arrivalTime: Time) {
        this.#actualTrainArrival = new Time(0, 0, 0);
        this.#actualTrainArrival = arrivalTime;
    }

    /**
     * Total delay time in seconds
     */
    get delayTimeInSeconds(): number {
        return Math.max(0, this.#dWait + this.#dConflict + this.#dExternal);
    }

    get currentWaitingTimeAtTheStationInSeconds(): number {
        return simulation.currentTime.toSeconds() - this.#actualTrainArrival.toSeconds();
    }
}
