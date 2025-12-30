import { Time } from "../utils/time";
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

    /** Indicates if the arrival or departure is happening the next day compared to the departure time from the previous stations */ // TODO - temporary solution - I made it achievable in the station method lateTrainsToArrive() (created Train instance is not achievable from in front of a station thus I cannot check the dayShift there)
    dayShift: Time | null = null;

    constructor(number: number, trainType: TrainCategory, customName: string | null = null) {
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
