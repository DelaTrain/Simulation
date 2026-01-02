/**
 * For representation of each Train Type depending on the train model/ company
 */

export class TrainCategory {
    /** Name of the train category */
    #name: string;
    /** Full name of the train category */
    #fullName: string;
    /** Priority scale value amongst trains */
    #priority: number = 0;
    /** The time exceeding which will result in some delay (in seconds) */
    #maxWaitingTime: number = 0;
    /** Speed value which cannot be surpassed in m/s */
    #maxVelocity: number = 0;
    /** Parameter describing capability of gaining the above speed in m/s^2 (maximal acceleration value) */
    #acceleration: number = 0;

    constructor(
        name: string,
        fullName: string,
        priority: number,
        maxWaitingTime: number,
        maxVelocity: number,
        acceleration: number
    ) {
        this.#name = name;
        this.#fullName = fullName;
        this.#priority = priority;
        this.#maxWaitingTime = maxWaitingTime;
        this.#maxVelocity = maxVelocity;
        this.#acceleration = acceleration;
    }

    // getters to use in the simulation logic and not to allow direct modification
    get name() {
        return this.#name;
    }
    get fullName() {
        return this.#fullName;
    }
    get priority() {
        return this.#priority;
    }
    get maxWaitingTime() {
        return this.#maxWaitingTime;
    }
    get maxVelocity() {
        return this.#maxVelocity;
    }
    get acceleration() {
        return this.#acceleration;
    }

    // getters for the editable fields in the UI
    get UIPriority() {
        return this.#priority;
    }
    get UIMaxWaitingTime() {
        return this.#maxWaitingTime;
    }
    get UIMaxVelocity() {
        return this.#maxVelocity;
    }
    get UIAcceleration() {
        return this.#acceleration;
    }
    // setters for the editable fields in the UI
    set UIPriority(value: number) {
        this.#priority = value;
    }
    set UIMaxWaitingTime(value: number) {
        this.#maxWaitingTime = value;
    }
    set UIMaxVelocity(value: number) {
        this.#maxVelocity = value;
    }
    set UIAcceleration(value: number) {
        this.#acceleration = value;
    }
}

export type EditableTrainCategoryFields = "UIPriority" | "UIMaxVelocity" | "UIAcceleration" | "UIMaxWaitingTime";
