import type { Position } from "../utils/position";
import type { Rail } from "./rail";
import { Train } from "./train";
import { SpawnTrainScheduleStep, TrainScheduleStep } from "./trainScheduleStep.ts";
import { Track } from "./track.ts";
import { simulation } from "./simulation.ts";
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
    #alreadySpawnedTrains: Set<TrainTemplate> = new Set();

    constructor(name: string, position: Position) {
        this.#name = name;
        this.#position = position;
    }

    // TODO - delay managing - in progress - @jakseluz

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

    addStartingTrain(train: TrainTemplate, departureTime: Time, track: Track) {
        this.#startingTrains.set(train, new SpawnTrainScheduleStep(train, departureTime, track));
    }

    step() {
        // check if any trains should depart or be destroyed
        this.departureTrains();
        // check if trains are to be spawned
        this.#startingTrains.forEach((schedule: SpawnTrainScheduleStep, train: TrainTemplate) => {
            if (
                simulation.currentTime.toSeconds() >= schedule.departureTime.toSeconds() &&
                !this.#alreadySpawnedTrains.has(train) &&
                this.spawnTrain(train, schedule.track) != null
            ) {
                this.#alreadySpawnedTrains.add(train);
            }
        });
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
    assignTrack(trainTemplate: TrainTemplate, preferredTrack: Track): Track | null {
        if (preferredTrack.currentOccupancy == null) {
            return preferredTrack;
        }
        const track = this.#tracks.find((track) => track.train == null);
        if (!track) {
            console.warn(
                `No available track for train ${trainTemplate.displayName()} at station ${this.#name}`,
                this.#tracks
            );
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
                    if (
                        simulation.currentTime.toSeconds() >=
                        trainSchedule.departureTime.toSeconds() + track.train.delay.delayTimeInSeconds
                    ) {
                        this.departTrain(track, trainSchedule);
                    }
                } else if (trainSchedule) {
                    // no departure time - train skips the station (departs immediately)
                    this.departTrain(track, trainSchedule);
                }
            }
        });
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
            train.position = new TrainPositionOnRail(trainSchedule.nextRail!, TrainDirection.FromStartToEnd, 0); // Is nextRail already in the schedule?
        } else {
            this.destroyTrain(train);
        }
    }

    spawnTrain(trainTemplate: TrainTemplate, preferredTrack: Track): Train | null {
        const track = this.assignTrack(trainTemplate, preferredTrack);
        if (track) {
            const train = new Train(track, trainTemplate);
            simulation.addTrain(train);
            track.trainArrival(train);
            return train;
        }
        return null;
    }

    destroyTrain(train: Train) {
        if (train.position instanceof Track === false || train.position.station !== this) {
            throw new Error(`Train ${train.displayName()} is not at station ${this.#name}`);
        }
        train.position.trainDepart();
        simulation.removeTrain(train);
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
