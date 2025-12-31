import type { Time } from "../utils/time";
import { Rail } from "./rail";
import { Station } from "./station";
import type { Track } from "./track";
import type { TrainTemplate } from "./trainTemplate";

export class TrainScheduleStep {
    /** Whether the Schedule has been completed (in order to check whether the train is delayed) */
    satisfied: boolean = false;

    constructor(
        public train: TrainTemplate,
        public arrivalTime: Time | null,
        public departureTime: Time | null,
        public nextStation: Station | null,
        public nextRail: Rail | null,
        public track: Track
    ) {}

    displayArrival() {
        return `${this.train.displayName()}\n${this.arrivalTime ? this.arrivalTime.toString() : " - "}`;
    }

    displayDeparture() {
        return `${this.train.displayName()}\n${this.departureTime ? this.departureTime.toString() : " - "}`;
    }
}

export class SpawnTrainScheduleStep {
    constructor(public train: TrainTemplate, public departureTime: Time, public track: Track) {}
}
