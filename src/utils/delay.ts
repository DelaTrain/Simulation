import { simulation } from "../core/simulation";
import { Time } from "./time";

export class Delay {
    #actualTrainArrival: Time = new Time(
        simulation.currentTime.hours,
        simulation.currentTime.minutes,
        simulation.currentTime.seconds
    );

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
    /** User-visible delay value in seconds */
    #UIDelayValue: number = 0;

    /** Departure time of the train from the previous station */
    #previousDepartureTime: Time | null = null;
    /** Indicates if the arrival or departure is happening the next day compared to the departure time from the previous stations */
    #dayShift: boolean = false;

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

    /**
     * Marks the current user delay as handled
     * @param timeHandled time in seconds that has been handled
     */
    userDelayHandle(timeHandled: number) {
        this.#dExternalAlreadyHandled += timeHandled;
    }

    /**
     * Reduces delays based on how late the train is at the next station
     * @param scheduleArrival scheduled arrival time in seconds
     */
    reduceDelaysAtStations(scheduleArrival: number) {
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
     * Checks if the arrival or departure is happening the next day compared to the departure time from the previous station
     * @param arrivalOrDepartureTime scheduled arrival or departure time
     * @returns boolean indicating if the arrival/departure is happening the next day
     */
    handleArrivalOrDepartureHappeningNextDay(arrivalOrDepartureTime: Time): boolean {
        if (this.#dayShift) {
            // TODO - if simulation was featuring multiple days, this would need to be more complex
            return true;
        }
        if (this.#previousDepartureTime) {
            if (arrivalOrDepartureTime.toSeconds() < this.#previousDepartureTime.toSeconds()) {
                this.#dayShift = true;
                return true;
            }
        }
        return false;
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

    /** Value displayed */
    get UIDelayValue(): number {
        return this.#UIDelayValue + (this.#dExternal - this.#dExternalAlreadyHandled);
    }

    set UIDelayValue(value: number) {
        this.#UIDelayValue = value;
    }

    /** Sets the actual arrival time of the train */
    set actualTrainArrival(arrivalTime: Time) {
        this.#actualTrainArrival = new Time(arrivalTime.hours, arrivalTime.minutes, arrivalTime.seconds);
    }

    set previousDepartureTime(departureTime: Time) {
        this.#previousDepartureTime = new Time(departureTime.hours, departureTime.minutes, departureTime.seconds);
    }
}
