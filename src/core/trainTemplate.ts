import type { TrainCategory } from "./trainCategory";
import type { Time } from "../utils/time";

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
}
