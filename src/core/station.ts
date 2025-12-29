import type { Position } from "../utils/position";
import type { Rail } from "./rail";
import { Train } from "./train";
import { SpawnTrainScheduleStep, TrainScheduleStep } from "./trainScheduleStep.ts";
import { Track } from "./track.ts";
import { START_TIME, simulation } from "./simulation.ts";
import type { Time } from "../utils/time.ts";
import type { TrainTemplate } from "./trainTemplate.ts";
import { TrainDirection, TrainPositionOnRail } from "./trainPosition.ts";

/**
 * For representation of each train Station
 */
export class Station {
    #name: string;
    #position: Position;

    /** contains info about each Train next goal */
    #trainsSchedule: Map<TrainTemplate, TrainScheduleStep> = new Map();
    /** Platform units of the Station */
    #tracks: Track[] = [];
    /** trains starting at this Station */
    #startingTrains: Map<TrainTemplate, SpawnTrainScheduleStep> = new Map();
    /** already spawned trains to avoid multiple spawns */
    #alreadySpawnedTrains: Set<TrainTemplate> = new Set();

    constructor(name: string, position: Position) {
        this.#name = name;
        this.#position = position;
    }

    /** Used in the importer module */
    addScheduleInfo(
        train: TrainTemplate,
        track: Track,
        arrivalTime: Time | null,
        departureTime: Time | null,
        nextStation: Station | null,
        railToNextStation: Rail | null
    ) {
        const scheduleStep = new TrainScheduleStep(
            train,
            arrivalTime,
            departureTime,
            nextStation,
            railToNextStation,
            track
        );
        this.#trainsSchedule.set(train, scheduleStep);
    }

    /** Used in the importer module */
    addStartingTrain(train: TrainTemplate, departureTime: Time, track: Track) {
        this.#startingTrains.set(train, new SpawnTrainScheduleStep(train, departureTime, track));
    }

    step() {
        // check if any trains should depart or be destroyed
        this.departureTrains();
        // check if trains are to be spawned
        this.spawnTrains();
    }

    reset() {
        this.#alreadySpawnedTrains.clear();
        this.#tracks.forEach((track) => {
            track.trainDepart();
        });
    }

    /**
     * Used by trains to get assigned to a Track at the Station
     * @param trainTemplate train template (new or existing) requesting the Track
     * @returns track assigned to the train
     */
    assignTrack(preferredTrack: Track, trainTemplate: TrainTemplate): Track | null {
        if (preferredTrack.train == null) {
            return preferredTrack;
        }
        const track = this.#tracks.find((track) => track.train == null);
        if (!track) {
            /*console.warn(
                `No available track for train ${trainTemplate.displayName()} at station ${this.#name}`,
                this.#tracks
            );*/
            return null;
        }
        return track;
    }

    /**
     * Handles train departures and destruction logic
     */
    departureTrains() {
        this.#tracks.forEach((track) => {
            if (track.train) {
                const trainSchedule = this.#trainsSchedule.get(track.train.trainTemplate);
                if (trainSchedule && trainSchedule.departureTime) {
                    const delayedTrains = this.lateTrainsToArrive();
                    const anyTrainToWaitFor = delayedTrains
                        .filter((t) => t !== track.train)
                        .some((t) => track.train!.shouldWaitLonger(t));
                    if (
                        /* prettier-ignore */
                        (track.train &&
                        !anyTrainToWaitFor) && // check if proper for sure
                        simulation.currentTime.toSeconds() >=
                            trainSchedule!.departureTime!.toSeconds()
                    ) {
                        this.departTrain(track, trainSchedule);
                    } else if (anyTrainToWaitFor) {
                        track.train!.delay.addWaitingDelay(simulation.timeStep);
                    }
                } else if (trainSchedule && trainSchedule.arrivalTime && !trainSchedule.departureTime) {
                    // no departure time - train ends here
                    const train = this.departTrain(track, trainSchedule);
                    //console.log(`Train ${train.displayName()} ends at the station: ${this.#name}`);
                } else if (trainSchedule) {
                    // no departure time - train skips the station (departs immediately)
                    const train = this.departTrain(track, trainSchedule);
                    //console.log(`Train ${train.displayName()} skips station ${this.#name}`);
                } else {
                    throw new Error(
                        `No schedule found for train ${track.train.displayName()} at station ${this.#name}`
                    );
                }
            }
        });
    }

    /**
     * Handles spawning of trains scheduled to start at this station
     */
    spawnTrains() {
        this.#startingTrains.forEach((schedule: SpawnTrainScheduleStep, train: TrainTemplate) => {
            if (
                simulation.currentTime.toSeconds() >= schedule.departureTime.toSeconds() &&
                !this.#alreadySpawnedTrains.has(train) &&
                this.spawnTrain(train, schedule.track) != null
            ) {
                if (schedule.departureTime < START_TIME) {
                    console.warn(
                        `Train ${train.displayName()} is spawned at station ${
                            this.#name
                        } with departure time before simulation start: ${schedule.departureTime.toString()}`
                    );
                }

                this.#alreadySpawnedTrains.add(train);
            }
        });
    }

    /**
     * Returns a list of trains that are late to arrive at the station
     * @returns array of late trains
     */
    lateTrainsToArrive(): Train[] {
        const delayedTrainsTemplates = Array.from(this.#trainsSchedule.entries())
            .filter(
                ([_, schedule]) =>
                    schedule &&
                    schedule.arrivalTime && // what about spawn trains without arrival time?
                    schedule.departureTime &&
                    !schedule.satisfied &&
                    schedule.departureTime.toSeconds() < simulation.currentTime.toSeconds()
            )
            .map(([trainTemplate]) => trainTemplate);

        const delayedTrains = simulation.trains.filter((train) => delayedTrainsTemplates.includes(train.trainTemplate));
        return delayedTrains;
    }

    /**
     * Handles single train departure from the station (or destruction) based on the given track and schedule
     * @param track track from which the train departs
     * @param trainSchedule train schedule info
     */
    departTrain(track: Track, trainSchedule: TrainScheduleStep) {
        const train = track.trainDepart()!;
        if (trainSchedule.nextStation && trainSchedule.nextRail) {
            // Assuming that the train has nextRail if it has nextStation
            train.nextStation = trainSchedule.nextStation;
            const direction =
                trainSchedule.nextRail.fromStation === this
                    ? TrainDirection.FromStartToEnd
                    : TrainDirection.FromEndToStart;
            train.position = new TrainPositionOnRail(trainSchedule.nextRail!, direction, 0);
        } else {
            this.destroyTrain(train);
        }
        trainSchedule.satisfied = true;
        return train;
    }

    spawnTrain(trainTemplate: TrainTemplate, preferredTrack: Track): Train | null {
        const track = this.assignTrack(preferredTrack, trainTemplate);
        if (track) {
            const train = new Train(track, trainTemplate);
            simulation.addTrain(train);
            track.trainArrival(train, null);
            return train;
        }
        return null;
    }

    destroyTrain(train: Train) {
        if (train.position instanceof Track === false || train.position.station !== this) {
            throw new Error(`Train ${train.displayName()} is not at station ${this.#name}`);
        }
        train.destroy();
    }

    addTrack(platformNumber: number, trackNumber: string): Track {
        const existingTrack = this.#tracks.filter(
            (t) => t.platformNumber === platformNumber && t.trackNumber === trackNumber
        );
        if (existingTrack.length > 0) return existingTrack[0];
        const newTrack = new Track(this, platformNumber, trackNumber);
        this.#tracks.push(newTrack);
        return newTrack;
    }

    nextArrivalForTrack(track: Track, time: Time): TrainScheduleStep | null {
        let nextSchedule: TrainScheduleStep | null = null;
        this.#trainsSchedule.forEach((schedule) => {
            if (
                schedule.track === track &&
                schedule.arrivalTime &&
                schedule.arrivalTime.toSeconds() >= time.toSeconds() &&
                (nextSchedule === null || schedule.arrivalTime.toSeconds() < nextSchedule.arrivalTime!.toSeconds())
            ) {
                nextSchedule = schedule;
            }
        });
        return nextSchedule;
    }

    nextDepartureForTrack(track: Track, time: Time): TrainScheduleStep | null {
        let nextSchedule: TrainScheduleStep | null = null;
        this.#trainsSchedule.forEach((schedule) => {
            if (
                schedule.track === track &&
                schedule.departureTime &&
                schedule.departureTime.toSeconds() >= time.toSeconds() &&
                (nextSchedule === null || schedule.departureTime.toSeconds() < nextSchedule.departureTime!.toSeconds())
            ) {
                nextSchedule = schedule;
            }
        });
        return nextSchedule;
    }

    get trainsSchedule() {
        return this.#trainsSchedule;
    }
    get tracks() {
        return this.#tracks;
    }
    get name(): string {
        return this.#name;
    }
    get position(): Position {
        return this.#position;
    }
}
