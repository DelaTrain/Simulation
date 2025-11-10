/**
 * For representation of each Train Type depending on the train model/ company
 */
export class TrainCategory {
    #name: string;
    /** priority scale value amongst trains */
    #priority: number = 0;
    /** the time exceeding which will result in some delay */
    #maxWaitingTime: number = 0;
    /** speed value which cannot be surpassed */
    #maxVelocity: number = 0;
    /** parameter describing capability of gaining the above speed */
    #acceleration: number = 0;

    constructor(name: string, priority: number, maxWaitingTime: number, maxVelocity: number, acceleration: number) {
        this.#name = name;
        this.#priority = priority;
        this.#maxWaitingTime = maxWaitingTime;
        this.#maxVelocity = maxVelocity;
        this.#acceleration = acceleration;
    }

    isWaiting(currentWaitingTime: number): boolean {
        // TODO
        return currentWaitingTime < this.#maxWaitingTime;
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
