import type { Time } from "../utils/time";
import { Rail } from "./rail";
import { Station } from "./station";

export class TrainScheduleStep {
    constructor(
        public trainID: number,
        public arrivalTime: Time | null,
        public departureTime: Time | null,
        public nextStation: Station | null,
        public nextRail: Rail | null
    ) {}
}
