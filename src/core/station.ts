import type { Position } from "../utils/position";
import type { Rail } from "./rail";
import { Train } from "./train";
import { SpawnTrainScheduleStep, TrainScheduleStep } from "./trainScheduleStep.ts";
import { Track } from "./track.ts";
import { START_TIME, simulation } from "./simulation.ts";
import type { Time } from "../utils/time.ts";
import type { TrainTemplate } from "./trainTemplate.ts";
import { TrainDirection, TrainPositionOnRail } from "./trainPosition.ts";
import type { ImportedData } from "../utils/importer.ts";

/**
 * For representation of each train Station in the simulation
 */
export class Station {
    /** Name of the station */
    #name: string;
    /** Indicates the geographical position of the station */
    #position: Position;
    /** Contains info about each train next goal */
    #trainsSchedule: Map<TrainTemplate, Array<TrainScheduleStep>> = new Map();
    /** Platform units of the station */
    #tracks: Track[] = [];
    /** Trains starting at this station */
    #startingTrains: Map<TrainTemplate, SpawnTrainScheduleStep> = new Map();
    /** Already spawned trains to avoid multiple spawns */
    #alreadySpawnedTrains: Set<TrainTemplate> = new Set();

    constructor(name: string, position: Position) {
        this.#name = name;
        this.#position = position;
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

    /** {@link simulation} step for the station */
    step() {
        // Check if any trains should depart or be destroyed
        this.departureTrains();
        // Check if trains are to be spawned
        this.spawnTrains();
    }

    /** Resets the station to initial state -> {@link simulation.reset} */
    reset() {
        this.#alreadySpawnedTrains.clear();
        this.#tracks.forEach((track) => {
            track.trainDepart();
        });
        this.#trainsSchedule.forEach((schedules) => {
            schedules.forEach((schedule) => {
                schedule.satisfied = false;
            });
        });
    }

    /**
     * Handles train departures and destruction logic
     */
    departureTrains() {
        this.#tracks.forEach((track) => {
            if (track.train) {
                const trainSchedule = this.#trainsSchedule
                    .get(track.train.trainTemplate)
                    ?.find((schedule) => schedule.satisfied === false);
                if (trainSchedule && trainSchedule.departureTime) {
                    const [delayedTrains, schedules] = this.lateTrainsToArrive();
                    const anyTrainToWaitFor = delayedTrains
                        .filter((t) => t !== track.train)
                        .some((t) => track.train!.shouldWaitLonger(t, schedules));
                    if (
                        track.train &&
                        simulation.currentTime.toSeconds() >= trainSchedule!.departureTime!.toSeconds() &&
                        !track.train.delay.handleArrivalOrDepartureHappeningNextDay(trainSchedule!.departureTime!) &&
                        (!anyTrainToWaitFor ||
                            this.currentExceedingTimeInSeconds(track.train) >
                                track.train.trainTemplate.type.maxWaitingTime)
                    ) {
                        // Normal departure
                        const train = this.departTrain(track, trainSchedule);

                        if (trainSchedule.satisfied !== true) {
                            throw new Error(
                                `Train ${train.displayName()} departure at station ${
                                    this.#name
                                } not marked as satisfied after departure.`
                            );
                        }
                    } else if (anyTrainToWaitFor) {
                        //track.train!.delay.addWaitingDelay(simulation.timeStep); // TODO - is it needed? Depends on how we want to present delays data #1
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
            // Update delay info
            train.delay.UIDelayValue = this.currentExceedingTimeInSeconds(train);
            if (trainSchedule.departureTime) {
                train.delay.previousDepartureTime = trainSchedule.departureTime;
            }
        } else {
            this.destroyTrain(train);
        }
        trainSchedule.satisfied = true;
        return train;
    }

    /**
     * Spawns a train at the station using {@link assignTrack} to get a track for the train
     * @param trainTemplate
     * @param preferredTrack
     * @returns
     */
    spawnTrain(trainTemplate: TrainTemplate, preferredTrack: Track): Train | null {
        const track = this.assignTrack(preferredTrack);
        if (track) {
            const train = new Train(track, trainTemplate);
            train.delay.actualTrainArrival = simulation.currentTime;
            simulation.addTrain(train);
            track.trainArrival(train, null);
            return train;
        }
        return null;
    }

    /**
     * Used by trains to get assigned to a track at the station
     * @param preferredTrack preferred track to assign to the train
     * @returns track assigned to the train - preferredTrack if available, otherwise any free track; null if no track is available
     */
    assignTrack(preferredTrack: Track): Track | null {
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
     * Returns a list of trains that are late to arrive at the station
     * @returns array of late trains at the station and the full trains schedule map
     */
    lateTrainsToArrive(): [Train[], Map<TrainTemplate, TrainScheduleStep[]>] {
        const delayedTrainsTemplates = Array.from(this.#trainsSchedule.entries())
            .filter(([_, schedules]) => {
                const schedule = schedules.find((schedule) => schedule.satisfied === false);
                return (
                    schedule &&
                    schedule.departureTime &&
                    schedule.satisfied === false &&
                    schedule.departureTime.toSeconds() < simulation.currentTime.toSeconds() &&
                    schedule.train.nextDayStations.has(this.#name) === false
                );
            })
            .map(([trainTemplate]) => trainTemplate);

        const delayedTrains = simulation.trains.filter((train) => delayedTrainsTemplates.includes(train.trainTemplate));
        return [delayedTrains, this.#trainsSchedule];
    }

    /**
     * Calculates the current exceeding departure or arrival time in seconds for a given train at this station
     * @param train train to check
     * @param departure boolean indicating whether to check departure time (true) or arrival time (false)
     * @returns
     */
    currentExceedingTimeInSeconds(train: Train, departure: boolean = true): number {
        const schedule = this.#trainsSchedule
            .get(train.trainTemplate)
            ?.find((schedule) => schedule.satisfied === false);
        if (schedule) {
            if (departure && schedule.departureTime) {
                if (train.delay.handleArrivalOrDepartureHappeningNextDay(schedule.departureTime)) {
                    return 0;
                } else {
                    return Math.max(0, simulation.currentTime.toSeconds() - schedule.departureTime.toSeconds());
                }
            } else if (!departure && schedule.arrivalTime) {
                if (train.delay.handleArrivalOrDepartureHappeningNextDay(schedule.arrivalTime)) {
                    return 0;
                } else {
                    return Math.max(0, simulation.currentTime.toSeconds() - schedule.arrivalTime.toSeconds());
                }
            } else {
                return 0;
            }
        } else {
            return 0;
        }
    }

    destroyTrain(train: Train) {
        if (train.position instanceof Track === false || train.position.station !== this) {
            throw new Error(`Train ${train.displayName()} is not at station ${this.#name}`);
        }
        train.destroy();
    }

    /* OTHER MODULES HELPERS */
    /* --------------------- */
    /* --------------------- */
    /* --------------------- */

    /** Used in the {@link ImportedData} module */
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
        if (!this.#trainsSchedule.has(train)) {
            this.#trainsSchedule.set(train, []);
        }
        this.#trainsSchedule.get(train)!.push(scheduleStep);
    }

    /** Used in the {@link ImportedData} module */
    addStartingTrain(train: TrainTemplate, departureTime: Time, track: Track) {
        this.#startingTrains.set(train, new SpawnTrainScheduleStep(train, departureTime, track));
    }

    /** Used in the {@link ImportedData} module */
    addTrack(platformNumber: number, trackNumber: string): Track {
        const existingTrack = this.#tracks.filter(
            (t) => t.platformNumber === platformNumber && t.trackNumber === trackNumber
        );
        if (existingTrack.length > 0) return existingTrack[0];
        const newTrack = new Track(this, platformNumber, trackNumber);
        this.#tracks.push(newTrack);
        return newTrack;
    }

    /** Used in the other module */
    nextArrivalForTrack(track: Track, time: Time): TrainScheduleStep | null {
        let nextSchedule: TrainScheduleStep | null = null;
        this.#trainsSchedule.forEach((schedules) => {
            const schedule = schedules.find((schedule) => schedule.satisfied === false);
            if (
                schedule &&
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

    /** Used in the other module */
    nextDepartureForTrack(track: Track, time: Time): TrainScheduleStep | null {
        let nextSchedule: TrainScheduleStep | null = null;
        this.#trainsSchedule.forEach((schedules) => {
            const schedule = schedules.find((schedule) => schedule.satisfied === false);
            if (
                schedule &&
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
}
