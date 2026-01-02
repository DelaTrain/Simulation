export class Time {
    constructor(private hour: number, private minute: number, private second: number) {}

    static fromString(timeString: string): Time {
        const [hours, minutes, seconds] = timeString.split(":").map((x: string) => parseInt(x, 10));
        return new Time(hours, minutes, seconds);
    }

    copy(): Time {
        return new Time(this.hour, this.minute, this.second);
    }

    toSeconds(): number {
        return this.hour * 3600 + this.minute * 60 + this.second;
    }

    addSeconds(secondsToAdd: number) {
        this.second += secondsToAdd;
        this.normalize();
        return this;
    }

    normalize() {
        if (this.second >= 60) {
            this.minute += Math.floor(this.second / 60);
            this.second = this.second % 60;
        }
        if (this.minute >= 60) {
            this.hour += Math.floor(this.minute / 60);
            this.minute = this.minute % 60;
        }
        if (this.second < 0) {
            const minuteBorrow = Math.ceil(Math.abs(this.second) / 60);
            this.minute -= minuteBorrow;
            this.second += minuteBorrow * 60;
        }
        if (this.minute < 0) {
            const hourBorrow = Math.ceil(Math.abs(this.minute) / 60);
            this.hour -= hourBorrow;
            this.minute += hourBorrow * 60;
        }
        if (this.hour < 0) {
            this.hour = 0;
            this.minute = 0;
            this.second = 0;
        }
    }

    get seconds(): number {
        return this.second;
    }

    get minutes(): number {
        return this.minute;
    }

    get hours(): number {
        return this.hour;
    }

    toString(): string {
        const hh = this.hour.toString().padStart(2, "0");
        const mm = this.minute.toString().padStart(2, "0");
        const ss = this.second.toString().padStart(2, "0");
        return `${hh}:${mm}:${ss}`;
    }
}
