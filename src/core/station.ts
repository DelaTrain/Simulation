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

    step() {
        // TODO: implement station logic for each step @jakseluz
        // check if trains are to be spawned
        // check if trains are to be destroyed
        // check if any trains should depart
        // handle taken track at the station when spawning trains
    }

    reset() {
        // TODO: do we need to reset something in Station?
    }

    spawnTrain(trainTemplate: TrainTemplate): Train {
        const track = this.#tracks.find((track) => track.train == null); //TODO: correct track selection logic
        if (!track) {
            throw new Error(
                `No available track to spawn train ${trainTemplate.displayName()} at station ${this.#name}`
            );
        }
        const train = new Train(track, trainTemplate);
        simulation.addTrain(train);
        track.trainArrival(train);
        return train;
    }

    destroyTrain(train: Train) {
        if (train.position instanceof Track === false || train.position.station !== this) {
            throw new Error(`Train ${train.displayName()} is not at station ${this.#name}`);
        }
        train.position.trainDepart();
        simulation.removeTrain(train);
    }

    get name(): string {
        return this.#name;
    }
    get position(): Position {
        return this.#position;
    }
}
