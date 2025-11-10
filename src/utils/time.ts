export class Time {

    constructor(
        private hour: number,
        private minute: number,
        private second: number
    ) { }

    toSeconds(): number {
        return this.hour * 3600 + this.minute * 60 + this.second;
    }

    addSeconds(secondsToAdd: number) {
        this.second += secondsToAdd;
    }

    normalize() {
        // TODO: fix later, @jaanonim
    }

    // TODO: dopisz gettery
}
