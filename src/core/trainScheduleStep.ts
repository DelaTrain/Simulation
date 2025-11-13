import type { Time } from "../utils/time";
import { Rail } from "./rail";
import { Station } from "./station";
import type { Track } from "./track";
import type { TrainTemplate } from "./trainTemplate";

export class TrainScheduleStep {
    satisfied: boolean = false; // whether the Schedule has been completed (to check whether the train is delayed)

    constructor(
        public train: TrainTemplate,
        public arrivalTime: Time | null,
        public departureTime: Time | null,
        public nextStation: Station | null,
        public nextRail: Rail | null,
        public track: Track
    ) {}

    displayArrival() {
        return `${this.train.displayName()}<br/>${this.arrivalTime ? this.arrivalTime.toString() : " - "}`;
    }

    displayDeparture() {
        return `${this.train.displayName()}<br/>${this.departureTime ? this.departureTime.toString() : " - "}`;
    }
}

export class SpawnTrainScheduleStep {
    constructor(public train: TrainTemplate, public departureTime: Time, public track: Track) {}
}
