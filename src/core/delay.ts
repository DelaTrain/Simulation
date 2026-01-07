import { simulation } from "./simulation";
import { Time } from "../utils/time";

/**
 * Class representing delay information for a train & storing delay-related data (including actual arrival time, user delays, current waiting time at a station, previous departure time, and day shift information - to be useful while at stations)
 */
export class Delay {
    #actualTrainArrival: Time = new Time(
        simulation.currentTime.hours,
        simulation.currentTime.minutes,
        simulation.currentTime.seconds
    );

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

    /** Sets the actual arrival time of the train */
    set actualTrainArrival(arrivalTime: Time) {
        this.#actualTrainArrival = new Time(arrivalTime.hours, arrivalTime.minutes, arrivalTime.seconds);
    }
    /**
     * Total exceeding of scheduled arrival time in seconds
     */
    get currentWaitingTimeAtTheStationInSeconds(): number {
        return simulation.currentTime.toSeconds() - this.#actualTrainArrival.toSeconds();
    }

    /**
     * Gets the user-visible delay value in seconds
     */
    get UIDelayValue(): number {
        return this.#UIDelayValue;
    }

    /**
     * Sets the user-visible delay value in seconds
     */
    set UIDelayValue(value: number) {
        this.#UIDelayValue = value;
    }

    /**
     * Sets the previous departure time from the last station
     * @param departureTime departure time from the previous station
     */
    set previousDepartureTime(departureTime: Time) {
        this.#previousDepartureTime = new Time(departureTime.hours, departureTime.minutes, departureTime.seconds);
    }
    /**
     * Adds external (user) delay
     * @param dExternal delay time in seconds
     */
    addDelay(dExternal: number) {
        this.#dExternal += dExternal;
        this.#UIDelayValue += dExternal;
    }

    /**
     * Marks the current user delay as handled
     * @param timeHandled time in seconds that has been handled
     */
    userDelayHandle(timeHandled: number) {
        this.#dExternalAlreadyHandled += timeHandled;
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
     * @param arrivalTime scheduled arrival time
     * @param departureTime scheduled departure time
     * @returns Object with two boolean properties:
     *  - nextDayArrival: true if arrival happens the next day
     *  - nextDayDeparture: true if departure happens the next day
     */
    handleArrivalOrDepartureHappeningNextDay(
        arrivalTime: Time | null,
        departureTime: Time | null
    ): { nextDayArrival: boolean; nextDayDeparture: boolean } {
        if (this.#dayShift) {
            // TODO - if simulation was featuring multiple days, this would need to be more complex
            return { nextDayArrival: true, nextDayDeparture: true };
        }
        if (this.#previousDepartureTime) {
            if (arrivalTime && arrivalTime.toSeconds() < this.#previousDepartureTime.toSeconds()) {
                this.#dayShift = true;
                return { nextDayArrival: true, nextDayDeparture: true };
            } else if (departureTime && departureTime.toSeconds() < this.#previousDepartureTime.toSeconds()) {
                this.#dayShift = true;
                return { nextDayArrival: false, nextDayDeparture: true };
            }
        }
        return { nextDayArrival: false, nextDayDeparture: false };
    }
}
