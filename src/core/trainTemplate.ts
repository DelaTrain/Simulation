import { TrainCategory } from "./trainCategory";

/**
 * For representation of each Train in the simulation
 */
export class TrainTemplate {
    /** should be unique in Poland */
    #number: number;
    /** train company (or their subcategory) */
    #type: TrainCategory;
    /** human-friendly name of the train */
    #customName: string | null;

    constructor(
        number: number,
        trainType: TrainCategory,
        customName: string | null = null
    ) {
        this.#number = number;
        this.#type = trainType;
        this.#customName = customName;
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
}
