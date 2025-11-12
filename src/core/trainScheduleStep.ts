import type { Time } from "../utils/time";
import { Rail } from "./rail";
import { Station } from "./station";
import type { Track } from "./track";

export class TrainScheduleStep {
    constructor(
        public trainNumber: number,
        public arrivalTime: Time | null,
        public departureTime: Time | null,
        public nextStation: Station | null,
        public nextRail: Rail | null,
        public track: Track
    ) {}

    displayArrival() {
        return `(${this.trainNumber}) ${this.arrivalTime ? this.arrivalTime.toString() : " - "}`;
    }

    displayDeparture() {
        return `(${this.trainNumber}) ${this.departureTime ? this.departureTime.toString() : " - "}`;
    }
}

export class SpawnTrainScheduleStep {
    constructor(public trainNumber: number, public departureTime: Time, public track: Track) {}
}
