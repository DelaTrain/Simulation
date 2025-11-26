import { simulation } from "../core/simulation";
import { Time } from "./time";

export class Delay {
    #actualTrainArrival: Time = new Time(0, 0, 0);

    #delay: number = 0;
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
     * Reduces delays based on how late the train is at the next station
     * @param latenessInSeconds how much late is the train at the next station
     */
    reduceDelays(scheduleArrival: number) {
        const latenessInSeconds = this.#actualTrainArrival.toSeconds() - scheduleArrival;
        let toSubstract = this.delayTimeInSeconds - latenessInSeconds;
        if (toSubstract > 0) {
            this.#dExternal -= toSubstract;
            if (this.#dExternal < 0) {
                this.#dWait -= -this.#dExternal;
                if (this.#dWait < 0) {
                    this.#dConflict -= -this.#dWait;
                    this.#dExternal = 0;
                    this.#dWait = 0;
                    if (this.#dConflict < 0) {
                        this.#dConflict = 0;
                    }
                }
            }
        }
    }

    /**
     * Total delay time in seconds
     */
    get delayTimeInSeconds(): number {
        this.#delay = Math.max(0, this.#dWait + this.#dConflict + this.#dExternal);
        return this.#delay;
    }

    get currentWaitingTimeAtTheStationInSeconds(): number {
        return simulation.currentTime.toSeconds() - this.#actualTrainArrival.toSeconds();
    }

    get userDelayInSeconds(): number {
        return this.#dExternal;
    }

    set userDelayInSeconds(delay: number) {
        this.#dExternal = delay;
    }
}
