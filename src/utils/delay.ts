export class Delay {
    #dWait: number = 0;
    #dConflict: number = 0;
    #dExternal: number = 0;

    addDelay(dExternal: number) {
        this.#dExternal += dExternal;
    }

    addWaitingDelay(dWait: number) {
        this.#dWait += dWait;
    }

    addConflictDelay(dConflict: number) {
        this.#dConflict += dConflict;
    }

    get delayTimeInSeconds(): number {
        return Math.max(0, this.#dWait + this.#dConflict + this.#dExternal);
    }
}
