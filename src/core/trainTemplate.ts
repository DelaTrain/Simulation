import { TrainCategory } from "./trainCategory";

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

    /** Indicates all stations from which the arrival is happening the next day compared to the departure time from the previous stations */
    nextDayStations: Set<string> = new Set();

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
