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
}

export class SpawnTrainScheduleStep {
    constructor(public trainNumber: number, public departureTime: Time, public track: Track) {}
}
