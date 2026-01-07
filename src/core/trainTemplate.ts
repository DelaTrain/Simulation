import type { TrainCategory } from "./trainCategory";
import type { Time } from "../utils/time";
import type { TrainScheduleStep } from "./trainScheduleStep";
import { simulation } from "./simulation";
import type { Station } from "./station";

/**
 * For representation of each Train in the simulation
 */
export class TrainTemplate {
    /** Train number - should be unique in Poland */
    #number: number;
    /** A train company (or their subcategory) */
    #type: TrainCategory;
    /** A human-friendly name of the train */
    #customName: string | null;
    /** Additional description lines for the train */
    #description: Array<string>;

    /** Indicates all stations from which the departure is happening the next day compared to the departure time from the previous stations */
    nextDayStations: Map<string, Array<Time | null>> = new Map();

    constructor(
        number: number,
        trainType: TrainCategory,
        customName: string | null = null,
        description: Array<string> = []
    ) {
        this.#number = number;
        this.#type = trainType;
        this.#customName = customName;
        this.#description = description;
    }

    displayName(): string {
        return `${this.#type.name} ${this.#number}${this.#customName ? ` "${this.#customName}"` : ""}`;
    }

    get number() {
        return this.#number;
    }
    get type() {
        return this.#type;
    }
    get description() {
        return this.#description;
    }

    /**
     * Gets the full schedule of the train
     * @returns array of TrainScheduleStep
     */
    getSchedules(): TrainScheduleStep[] {
        const starting = Array.from(simulation.stations.values()).filter((s: Station) => s.startingTrains.has(this));
        if (starting.length !== 1) {
            console.error("Train starting station not found or multiple found");
            return [];
        }

        let count = 0;
        const results: TrainScheduleStep[] = [];
        let station: Station = starting[0];
        let lastStopTime: number = 0;
        let visited: Set<TrainScheduleStep> = new Set();
        while (station) {
            count++;
            if (count > 200) {
                console.error("Infinite loop detected in getSchedules for train " + this.displayName());
                break;
            }
            const schedules = station.trainsSchedule.get(this);
            if (schedules === undefined) break;
            const schedule = schedules
                .filter((s) => (s.departureTime ? s.departureTime.toSeconds() > lastStopTime : true))
                .sort((a, b) => {
                    const timeA = a.departureTime
                        ? a.departureTime.toSeconds()
                        : a.arrivalTime
                        ? a.arrivalTime.toSeconds()
                        : Infinity;
                    const timeB = b.departureTime
                        ? b.departureTime.toSeconds()
                        : b.arrivalTime
                        ? b.arrivalTime.toSeconds()
                        : Infinity;
                    return timeA - timeB;
                })
                .find((s) => !visited.has(s));
            if (!schedule) break;
            results.push(schedule);
            visited.add(schedule);
            lastStopTime = schedule.departureTime === null ? lastStopTime : schedule.departureTime.toSeconds();
            if (schedule.nextStation === null) break;
            station = schedule.nextStation;
        }
        return results.filter((s) => s.departureTime !== null || s.arrivalTime !== null);
    }
}
