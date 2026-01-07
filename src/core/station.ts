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
    /** Importance of the station (number of trains using it) */
    #importance: number;
    /** Contains info about each train next goal */
    #trainsSchedule: Map<TrainTemplate, Array<TrainScheduleStep>> = new Map();
    /** Platform units of the station */
    #tracks: Track[] = [];
    /** Trains starting at this station */
    #startingTrains: Map<TrainTemplate, SpawnTrainScheduleStep> = new Map();
    /** Already spawned trains to avoid multiple spawns */
    #alreadySpawnedTrains: Set<TrainTemplate> = new Set();
    /** Minimum waiting time at the station in seconds */
    minWaitingTimeAtTheStation: number = 15;
    /** Percentage of the scheduled waiting time required to be waited */
    requiredWaitingTimePercentage: number = 0.3; // 30% of the scheduled waiting time
    /** External block track - as taken */
    #block: boolean = false;

    constructor(name: string, position: Position, importance: number = 0) {
        this.#name = name;
        this.#position = position;
        this.#importance = importance;
        this.#block = false;
    }

    get trainsSchedule() {
        return this.#trainsSchedule;
    }
    get startingTrains() {
        return this.#startingTrains;
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
    get importance(): number {
        return this.#importance;
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
                schedule.reset();
            });
        });
        this.#block = false;
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
                        track.train && // train is still at the track
                        simulation.currentTime.toSeconds() >= trainSchedule!.departureTime!.toSeconds() && // departure time reached
                        !track.train.delay.handleArrivalOrDepartureHappeningNextDay(
                            trainSchedule!.arrivalTime,
                            trainSchedule!.departureTime
                        ).nextDayDeparture && // not next day departure
                        (!anyTrainToWaitFor ||
                            this.currentExceedingTimeInSeconds(track.train) >
                                track.train.trainTemplate.type.maxWaitingTime) && // no other delayed trains to wait for or exceeded max waiting time
                        track.train.delay.currentWaitingTimeAtTheStationInSeconds >=
                            Math.max(
                                trainSchedule.arrivalTime
                                    ? (trainSchedule.departureTime.toSeconds() -
                                          trainSchedule.arrivalTime.toSeconds()) *
                                          this.requiredWaitingTimePercentage
                                    : 0,
                                this.minWaitingTimeAtTheStation + trainSchedule.minWaitingTimeAtStation
                            ) // ensure minimum waiting time at the station
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
                        // Train has to wait longer for other delayed trains - increase UI delay value
                        track.train.delay.UIDelayValue += simulation.timeStep;
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

            if (trainSchedule.departureTime) {
                train.delay.previousDepartureTime = trainSchedule.departureTime;
                // Update delay info
                train.delay.UIDelayValue = this.currentExceedingTimeInSeconds(train);
            }
        } else {
            this.destroyTrain(train);
        }
        trainSchedule.setDeparture(simulation.currentTime); // this marks the schedule as satisfied
        return train;
    }

    /**
     * Spawns a train at the station using {@link assignTrack} to get a track for the train
     * @param trainTemplate
     * @param preferredTrack
     * @returns
     */
    spawnTrain(trainTemplate: TrainTemplate, preferredTrack: Track): Train | null {
        const track = this.assignTrack(preferredTrack, trainTemplate);
        if (track) {
            const train = new Train(track, trainTemplate);
            trainTemplate.assignTrain(train);
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
    assignTrack(preferredTrack: Track, trainTemplate: TrainTemplate): Track | null {
        if (this.#tracks.length === 0) {
            throw new Error(`Station ${this.#name} has no tracks defined.`);
        }
        if (preferredTrack.station !== this) {
            throw new Error(
                `Preferred track ${preferredTrack.platformNumber}-${
                    preferredTrack.trackNumber
                } does not belong to station ${this.#name}.`
            );
        }

        // Handle blocked station
        if (this.#block) {
            console.warn(
                `Station ${this.#name} is blocked. No track can be assigned to train ${trainTemplate.displayName()}.`
            );
            return null;
        }

        // Special handling for buses and default type ?trains?
        if (trainTemplate.type.name === "BUS" || trainTemplate.type.name === "DEFAULT") {
            if (preferredTrack.train == null) {
                return preferredTrack;
            } else {
                /*console.warn(
                    `No available track for train ${trainTemplate.displayName()} at station ${this.#name}`,
                    this.#tracks
                );*/
                return null;
            }
        }

        // Try to assign preferred and not a fictitious track if possible (fictitious track has platformNumber 0 and is used if a station has no real tracks)
        if ((this.#tracks[0].platformNumber !== 0 || this.#tracks.length === 1) && preferredTrack.train == null) {
            return preferredTrack;
        }
        const schedule = this.#trainsSchedule.get(trainTemplate)?.find((s) => s.satisfied === false);
        const track = (
            this.#tracks.length > 1 && !(schedule?.departureTime == null && schedule?.arrivalTime == null)
                ? this.#tracks.filter((track) => track.platformNumber !== 0)
                : this.#tracks
        ).find((track) => track.train == null);
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
                    !schedule.train.nextDayStations
                        .get(this.#name)
                        ?.some((scheduleTime) => scheduleTime!.toSeconds() === schedule.departureTime!.toSeconds()) &&
                    (schedule.arrivalTime ? schedule.arrivalTime.toSeconds() > 0 : true)
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
                if (
                    train.delay.handleArrivalOrDepartureHappeningNextDay(null, schedule.departureTime).nextDayDeparture
                ) {
                    return 0;
                } else {
                    return Math.max(0, simulation.currentTime.toSeconds() - schedule.departureTime.toSeconds());
                }
            } else if (!departure && schedule.arrivalTime) {
                if (train.delay.handleArrivalOrDepartureHappeningNextDay(schedule.arrivalTime, null).nextDayArrival) {
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
        railToNextStation: Rail | null,
        minWaitingTimeAtTheStation: number = 0
    ) {
        const scheduleStep = new TrainScheduleStep(
            train,
            arrivalTime,
            departureTime,
            nextStation,
            railToNextStation,
            track,
            minWaitingTimeAtTheStation
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
    addTrack(platformNumber: number, trackNumber: string, isHidden = false): Track {
        const existingTrack = this.#tracks.filter(
            (t) => t.platformNumber === platformNumber && t.trackNumber === trackNumber
        );
        if (existingTrack.length > 0) return existingTrack[0];
        const newTrack = new Track(this, platformNumber, trackNumber, isHidden);
        this.#tracks.push(newTrack);
        return newTrack;
    }

    /** Used in the other module */
    nextArrivalForTrack(track: Track): TrainScheduleStep | null {
        return Array.from(this.#trainsSchedule.values())
            .map((schedules: TrainScheduleStep[]) =>
                schedules.find((schedule: TrainScheduleStep) => schedule.satisfied === false)
            )
            .filter((schedule): schedule is TrainScheduleStep => schedule !== undefined)
            .filter((schedule: TrainScheduleStep) => schedule.track === track)
            .filter((schedule: TrainScheduleStep) => schedule.arrivalTime !== null)
            .sort((a, b) => {
                const at = a.arrivalTime ? a.arrivalTime.toSeconds() : Infinity;
                const bt = b.arrivalTime ? b.arrivalTime.toSeconds() : Infinity;
                return at - bt;
            })[0];
    }

    /** Used in the other module */
    nextDepartureForTrack(track: Track): TrainScheduleStep | null {
        return Array.from(this.#trainsSchedule.values())
            .map((schedules: TrainScheduleStep[]) =>
                schedules.find((schedule: TrainScheduleStep) => schedule.satisfied === false)
            )
            .filter((schedule): schedule is TrainScheduleStep => schedule !== undefined)
            .filter((schedule: TrainScheduleStep) => schedule.track === track)
            .filter((schedule: TrainScheduleStep) => schedule.departureTime !== null)
            .sort((a, b) => {
                const at = a.departureTime ? a.departureTime.toSeconds() : Infinity;
                const bt = b.departureTime ? b.departureTime.toSeconds() : Infinity;
                return at - bt;
            })[0];
    }

    blockAllTracks() {
        this.#block = true;
    }

    unblockAllTracks() {
        this.#block = false;
    }

    isBlocked(): boolean {
        return this.#block;
    }
}
