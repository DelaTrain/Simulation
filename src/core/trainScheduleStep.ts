import type { Time } from "../utils/time";
import { Rail } from "./rail";
import { Station } from "./station";
import type { Track } from "./track";
import type { TrainTemplate } from "./trainTemplate";

export class TrainScheduleStep {
    /** Whether the Schedule has been completed (in order to check whether the train is delayed) */
    realArrivalTime: Time | null = null;
    realDepartureTime: Time | null = null;

    constructor(
        public train: TrainTemplate,
        public arrivalTime: Time | null,
        public departureTime: Time | null,
        public nextStation: Station | null,
        public nextRail: Rail | null,
        public track: Track
    ) {}

    setArrival(time: Time) {
        this.realArrivalTime = time.copy();
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
    }
}

export class SpawnTrainScheduleStep {
    constructor(public train: TrainTemplate, public departureTime: Time, public track: Track) {}
}
