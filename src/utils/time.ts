export class Time {
    constructor(private hour: number, private minute: number, private second: number) {}

    toSeconds(): number {
        return this.hour * 3600 + this.minute * 60 + this.second;
    }

    addSeconds(secondsToAdd: number) {
        this.second += secondsToAdd;
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
}
