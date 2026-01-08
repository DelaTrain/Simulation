export class Time {
    private second: number;
    constructor(hour: number, minute: number, second: number) {
        this.second = second + minute * 60 + hour * 3600;
    }

    static fromString(timeString: string): Time {
        const [hours, minutes, seconds] = timeString.split(":").map((x: string) => parseInt(x, 10));
        return new Time(hours, minutes, seconds);
    }

    copy(): Time {
        return new Time(0, 0, this.second);
    }

    toSeconds(): number {
        return this.second;
    }

    addSeconds(secondsToAdd: number) {
        this.second += secondsToAdd;
        return this;
    }

    get seconds(): number {
        return this.second % 60;
    }

    get minutes(): number {
        return Math.floor((this.second % 3600) / 60);
    }

    get hours(): number {
        return Math.floor(this.second / 3600);
    }

    toString(): string {
        const hh = this.hours.toString().padStart(2, "0");
        const mm = this.minutes.toString().padStart(2, "0");
        const ss = this.seconds.toString().padStart(2, "0");
        return `${hh}:${mm}:${ss}`;
    }

    toShortString(): string {
        const hh = this.hours.toString().padStart(2, "0");
        const mm = this.minutes.toString().padStart(2, "0");
        return `${hh}:${mm}`;
    }
}
