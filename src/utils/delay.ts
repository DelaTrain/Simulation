import { simulation } from "../core/simulation";
import { Time } from "./time";

export class Delay {
    #actualTrainArrival: Time = new Time(0, 0, 0);

    /** Total delay time in seconds, updated each delayTimeInSeconds getter call */
    #delay: number = 0;
    /** Delay due to waiting for other Trains in seconds */
    #dWait: number = 0;
    /** Delay due to Station Track conflicts in seconds */
    #dConflict: number = 0;
    /** External (user) delay in seconds */
    #dExternal: number = 0;
    /** To recognise if the train has already been stopped by the external Delay */
    #dExternalAlreadyHandled: number = 0;

    #UIDelayValue: number = 0;

    /**
     * Adds external (user) delay
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

    /** Sets the actual arrival time of the train */
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
            this.#dExternalAlreadyHandled -= toSubstract;
            if (this.#dExternal < 0) {
                this.#dWait -= -this.#dExternal;
                if (this.#dWait < 0) {
                    this.#dConflict -= -this.#dWait;
                    this.#dExternal = 0;
                    this.#dExternalAlreadyHandled = 0;
                    this.#dWait = 0;
                    if (this.#dConflict < 0) {
                        this.#dConflict = 0;
                    }
                }
            }
        }
    }

    /**
     * Checks if the user delay has already been handled (train already had been stopped)
     * @returns boolean indicating if the user delay has already been handled
     */
    dUserAlreadyHandled(): boolean {
        return this.#dExternalAlreadyHandled === this.#dExternal;
    }

    /**
     * Marks the current user delay as handled
     */
    userDelayHandle(timeHandled: number) {
        this.#dExternalAlreadyHandled += timeHandled;
    }

    /**
     * FOR USE IN THE SIMULATION LOGIC ONLY
     * Total delay time in seconds
     */
    get delayTimeInSeconds(): number {
        this.#delay = Math.max(0, this.#dWait + this.#dConflict + this.#dExternal);
        //this.#delay = this.#dWait + this.#dConflict + this.#dExternal;
        return this.#delay;
    }

    /**
     * Total exceeding of scheduled arrival time in seconds
     */
    get currentWaitingTimeAtTheStationInSeconds(): number {
        return simulation.currentTime.toSeconds() - this.#actualTrainArrival.toSeconds();
    }

    /**
     * User (external) delay in seconds which has not been reduced yet
     */
    get userDelayInSeconds(): number {
        return this.#dExternal;
    }

    /**
     * User (external) delay in seconds which has not been reduced yet
     */
    set userDelayInSeconds(delay: number) {
        this.#dExternal = delay;
    }

    /** FOR USE IN THE SIMULATION LOGIC ONLY */
    set UIDelayValue(value: number) {
        this.#UIDelayValue = value;
    }

    /** Value displayed */
    get UIDelayValue(): number {
        return this.#UIDelayValue;
    }
}
