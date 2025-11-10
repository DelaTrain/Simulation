import type { Position } from "../utils/position";
import type { Rail } from "./rail";
import { Train } from "./train";
import { TrainScheduleStep } from "./trainScheduleStep.ts";
import { Track } from "./track.ts";
import { simulation } from "./simulation.ts";
import type { Time } from "../utils/time.ts";
import type { TrainTemplate } from "./trainTemplate.ts";

/**
 * For representation of each train Station
 */
export class Station {
    #name: string;
    #position: Position;

    /** contains info about each Train next goal, especially the distance to the next Station */
    #trainsSchedule: Map<TrainTemplate, TrainScheduleStep> = new Map();
    /** Platform units of the Station */
    #tracks: Track[] = [];
    /** trains starting at this Station */
    #startingTrains: Map<Time, TrainTemplate> = new Map();

    constructor(name: string, position: Position) {
        this.#name = name;
        this.#position = position;
    }

    // TODO - metody rozwiązują problem "zabijania" pociągów (kiedy pociągi jadą do nulla)
    // TODO - creating and starting trains methods
    // TODO - delay managing -> the most complex mechanism

    addScheduleInfo(
        train: TrainTemplate,
        arrivalTime: Time | null,
        departureTime: Time | null,
        nextStation: Station | null,
        railToNextStation: Rail | null
    ) {
        const scheduleStep = new TrainScheduleStep(
            train.number,
            arrivalTime,
            departureTime,
            nextStation,
            railToNextStation
        );
        this.#trainsSchedule.set(train, scheduleStep);
    }

    addStartingTrain(train: TrainTemplate, departureTime: Time) {
        this.#startingTrains.set(departureTime, train);
    }

    get name(): string {
        return this.#name;
    }
    get position(): Position {
        return this.#position;
    }
}
