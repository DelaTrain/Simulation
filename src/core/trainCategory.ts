/**
 * For representation of each Train Type depending on the train model/ company
 */
export class TrainCategory {
    /** Name of the train category */
    #name: string;
    /** Priority scale value amongst trains */
    #priority: number = 0;
    /** The time exceeding which will result in some delay (in seconds) */
    #maxWaitingTime: number = 0;
    /** Speed value which cannot be surpassed in m/s */
    #maxVelocity: number = 0;
    /** Parameter describing capability of gaining the above speed in m/s^2 (maximal acceleration value) */
    #acceleration: number = 0;

    constructor(name: string, priority: number, maxWaitingTime: number, maxVelocity: number, acceleration: number) {
        this.#name = name;
        this.#priority = priority;
        this.#maxWaitingTime = maxWaitingTime;
        this.#maxVelocity = maxVelocity;
        this.#acceleration = acceleration;
    }

    /**
     * The time exceeding which will result in giving up waiting (in seconds)
     */
    get maxWaitingTime() {
        return this.#maxWaitingTime;
    }

    get name() {
        return this.#name;
    }
    get priority() {
        return this.#priority;
    }
    get maxVelocity() {
        return this.#maxVelocity;
    }
    get acceleration() {
        return this.#acceleration;
    }
}
