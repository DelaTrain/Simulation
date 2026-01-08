import type { Time } from "../utils/time";
import { Rail } from "./rail";
import { Station } from "./station";
import type { Track } from "./track";
import type { TrainTemplate } from "./trainTemplate";

export class TrainScheduleStep {
    static arrivedDelayed: Array<{
        min: number;
        max: number;
        count: number;
    }> = [
        { min: -1, max: 359, count: 0 },
        { min: 360, max: 3599, count: 0 },
        { min: 3600, max: 7199, count: 0 },
        { min: 7200, max: Infinity, count: 0 },
    ];

    /** Whether the Schedule has been completed (in order to check whether the train is delayed) */
    realArrivalTime: Time | null = null;
    realDepartureTime: Time | null = null;

    constructor(
        public train: TrainTemplate,
        public arrivalTime: Time | null,
        public departureTime: Time | null,
        public nextStation: Station | null,
        public nextRail: Rail | null,
        public track: Track,
        public minWaitingTimeAtStation: number = 0
    ) {}

    setArrival(time: Time) {
        this.realArrivalTime = time.copy();
        if (this.arrivalTime) {
            const secondsLate = this.realArrivalTime.toSeconds() - this.arrivalTime.toSeconds();
            TrainScheduleStep.arrivedDelayed.forEach((range) => {
                if (secondsLate >= range.min && secondsLate <= range.max) {
                    range.count += 1;
                }
            });
        }
        return this;
    }

    setDeparture(time: Time) {
        this.realDepartureTime = time.copy();
        return this;
    }

    get satisfied(): boolean {
        return this.realDepartureTime !== null;
    }

    reset() {
        this.realArrivalTime = null;
        this.realDepartureTime = null;
        TrainScheduleStep.arrivedDelayed.forEach((range) => {
            range.count = 0;
        });
    }
}

export class SpawnTrainScheduleStep {
    constructor(public train: TrainTemplate, public departureTime: Time, public track: Track) {}
}
