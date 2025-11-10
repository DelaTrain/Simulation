import type { Time } from "../utils/time";
import { Rail } from "./rail";
import { Station } from "./station";

export class TrainScheduleStep {

    constructor(
        private trainID: number,
        private arrivalTime: Time | null,
        private departureTime: Time | null,
        private nextStation: Station | null,
        private nextRail: Rail | null,
    ) {}

    // TODO: gettery
}
