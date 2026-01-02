import { TrainPositionOnRail, type TrainPosition } from "./trainPosition";
import { TrainTemplate } from "./trainTemplate";
import { Track } from "./track";
import { simulation } from "./simulation";
import type { Station } from "./station";
import { Delay } from "./delay";
import type { TrainScheduleStep } from "./trainScheduleStep";
import type { Position } from "../utils/position";

/** Train acceleration status */
enum AccelerationStatus {
    Accelerating,
    Decelerating,
    Constant,
}

/**
 * For representation of each Train in the simulation
 */
export class Train {
    /** More abstract representation of the train */
    trainTemplate: TrainTemplate;
    /** Train speed value - meters per second */
    #velocity: number = 0;
    /** Train acceleration status */
    #acceleration: AccelerationStatus = AccelerationStatus.Accelerating;
    /** Contains distance and rail number */
    #position: TrainPosition;
    /** Individual time of being late */
    #delay: Delay = new Delay();
    /** Next Station */
    #nextStation: Station | null = null;
    /** If waiting for the station */
    #isWaiting: boolean = false;
    /** If destroyed */
    #destroyed: boolean = false;

    constructor(track: Track, trainTemplate: TrainTemplate) {
        this.trainTemplate = trainTemplate;
        this.#position = track;
    }

    set position(newPosition: TrainPosition) {
        this.#position = newPosition;
    }
    set nextStation(station: Station | null) {
        this.#nextStation = station;
    }

    /** Distance to the next station in meters, or null if not on a rail */
    get distanceToNextStation(): number | null {
        if (this.#position instanceof TrainPositionOnRail) {
            return this.#position.getDistanceToNextStation();
        }
        return null;
    }
    get number() {
        return this.trainTemplate.number;
    }
    get type() {
        return this.trainTemplate.type;
    }
    get velocity() {
        return this.#velocity;
    }
    get acceleration() {
        return this.#acceleration;
    }
    get position() {
        return this.#position;
    }
    get delay() {
        return this.#delay;
    }
    get destroyed() {
        return this.#destroyed;
    }

    // TODO - think about delay calculations when moving between stations + correct statistic (graphs, etc.)
    /** {@link simulation} step for the train */
    step() {
        if (!this.#isWaiting) {
            this.move();
            this.handleNextStationArrival();
        } else {
            // The train is at/before the station - no movement
            this.handleNextStationArrival();
        }

        // Test code - checking if the train exceeded max waiting time at the station
        this.warnIfLateAtStation();
    }

    /**
     * Train movement logic
     */
    move() {
        // If the train is on the rail, not at the station
        if (this.#position instanceof TrainPositionOnRail) {
            // Updating position based on velocity and acceleration
            if (this.#delay.dUserAlreadyHandled()) {
                this.#updateVelocity();
                this.#position.move(this.#velocity * simulation.timeStep);
            } else {
                this.stop();
                this.#delay.userDelayHandle(simulation.timeStep);
            }
        }
    }

    /** Approaching the next station logic */
    handleNextStationArrival() {
        if (this.#nextStation) {
            // Check if the train is on the rail
            if (!(this.#position instanceof TrainPositionOnRail)) {
                return;
            }
            const distanceBeyondTracks =
                (this.#position as TrainPositionOnRail).distance - this.#position.rail.length();
            const arrived = distanceBeyondTracks >= -1;
            // Fix position if the train was too fast :)
            if (distanceBeyondTracks > 0) {
                this.#position.move(-distanceBeyondTracks);
            }

            // Check if the train reached its next station
            const nextSchedule = this.#nextStation.trainsSchedule
                .get(this.trainTemplate)
                ?.find((schedule) => schedule.satisfied === false);

            if (arrived) {
                if (nextSchedule) {
                    if (nextSchedule.arrivalTime) {
                        if (simulation.currentTime.toSeconds() < nextSchedule.arrivalTime.toSeconds()) {
                            // Early arrival - wait before entering the station
                            this.stop();
                            this.#isWaiting = true;
                            return;
                        }
                    }
                    const trackAtTheStation = this.#nextStation.assignTrack(nextSchedule.track, this.trainTemplate);

                    if (trackAtTheStation == null) {
                        // Cannot arrive at the station - track full; waiting
                        this.stop();
                        this.#isWaiting = true;
                        //this.#delay.addConflictDelay(this.calculateConflictDelay());  // TODO - is it needed? Depends on how we want to present delays data #2
                        return;
                    } else {
                        // Arriving at the station
                        this.#isWaiting = false;
                        this.#position = trackAtTheStation; // TrainPositionOnRail no longer useful
                        this.#nextStation = null;

                        // Only if this is a real stop
                        if (nextSchedule.arrivalTime) {
                            this.stop();
                        }

                        this.#position.trainArrival(this, nextSchedule.arrivalTime);
                    }
                } else {
                    throw new Error("Train schedule missing for the next station");
                }
            }
        } else {
            // Despawning in the station logic, if nextStation is null
        }
    }

    /**
     * Updates the train velocity based on its acceleration and next station proximity
     */
    #updateVelocity() {
        if (this.#position instanceof TrainPositionOnRail) {
            const velocityForcedByNextStation = this.calculateArrivingVelocity();
            const previousVelocity = this.#velocity;
            this.#velocity = Math.min(
                this.#position.rail.getMaxSpeed(this.#position.distance),
                this.trainTemplate.type.maxVelocity,
                this.#velocity + this.trainTemplate.type.acceleration * simulation.timeStep,
                velocityForcedByNextStation !== null ? velocityForcedByNextStation : Infinity
            );

            // Update acceleration status
            if (this.#velocity < previousVelocity) {
                this.#acceleration = AccelerationStatus.Decelerating;
            } else if (this.#velocity > previousVelocity) {
                this.#acceleration = AccelerationStatus.Accelerating;
            } else {
                this.#acceleration = AccelerationStatus.Constant;
            }
        }
    }

    /**
     * Calculates the velocity needed to arrive at the next station
     */
    calculateArrivingVelocity(): number | null {
        if (this.#nextStation && this.#position instanceof TrainPositionOnRail) {
            let velocity = this.#velocity;
            if (this.trainTemplate.type.maxVelocity < 33 && this.distanceToNextStation! < 1200) {
                velocity -= (0.7 + Math.random() * (0.9 - 0.7)) * simulation.timeStep;
            } else if (
                this.trainTemplate.type.maxVelocity >= 33 &&
                this.trainTemplate.type.maxVelocity < 44 &&
                this.distanceToNextStation! < 3000
            ) {
                velocity -= (0.5 + Math.random() * (0.7 - 0.5)) * simulation.timeStep;
            } else if (
                this.trainTemplate.type.maxVelocity >= 44 &&
                this.trainTemplate.type.maxVelocity < 56 &&
                this.distanceToNextStation! < 6000
            ) {
                velocity -= (0.4 + Math.random() * (0.5 - 0.4)) * simulation.timeStep;
            } /*else if (this.distanceToNextStation! < 2000) { // for freight trains
                velocity -= (0.3 + Math.random() * (0.5 - 0.3)) * simulation.timeStep;
            }*/ else {
                return null; // no need to reduce speed yet
            }
            return Math.max(
                velocity,
                Math.min(this.trainTemplate.type.maxVelocity, this.distanceToNextStation! < 200 ? 6 : 18)
            ); // minimum arriving speed 6 m/s (21.6 km/h) or 18 m/s (64.8 km/h) depending on distance
        }
        return null;
    }

    /**
     *
     * @returns current possible acceleration value in m/s^2
     */
    #currentAcceleration(): number {
        return this.trainTemplate.type.acceleration;
    }

    /**
     * Stops the train (sets velocity to 0)
     */
    stop() {
        this.#velocity = 0;
        this.#acceleration = AccelerationStatus.Constant;
    }

    /**
     * Adds external delays
     * @param delaySeconds external delay time in seconds
     */
    addDelay(delaySeconds: number) {
        this.#delay.addDelay(delaySeconds);
    }

    /**
     * Calculates delay due to (track occupancy) conflicts at the next station
     * @returns delay time in seconds
     */
    calculateConflictDelay(): number {
        let conflictDelay: number = 0;
        if (this.#nextStation) {
            const trackNumber = this.#nextStation.trainsSchedule
                .get(this.trainTemplate)
                ?.find((schedule) => schedule.satisfied === false)?.track.trackNumber;
            const trackTrain = this.#nextStation.tracks.find((t) => t.trackNumber === trackNumber)?.train;

            if (trackTrain) {
                let trackTrainSchedule = this.#nextStation!.trainsSchedule.get(trackTrain.trainTemplate)?.find(
                    (schedule) => schedule.satisfied === false
                );
                if (trackTrainSchedule) {
                    if (trackTrainSchedule.departureTime) {
                        conflictDelay =
                            trackTrainSchedule.departureTime.toSeconds() - simulation.currentTime.toSeconds();
                    }
                }
            }
        }
        return conflictDelay;
    }

    /**
     * Determines if the train should wait longer at the station for other trains with specific priorities
     * @param otherTrain train to wait for (or not to wait for)
     * @returns boolean indicating whether to wait longer
     */
    shouldWaitLonger(otherTrain: Train, schedules: Map<TrainTemplate, TrainScheduleStep[]>): boolean | null {
        // Check if this train is at a station
        if (!(this.position instanceof Track)) {
            return null;
        }
        // Check if the other train has a schedule at a station in which the train has a schedule time later than the current simulation time
        const schedule = schedules.get(otherTrain.trainTemplate)?.find((s) => s.satisfied === false);
        if (!schedule) {
            return false;
        } else if (
            schedule.arrivalTime
                ? schedule.arrivalTime?.toSeconds()
                : (schedule.departureTime ? schedule.departureTime.toSeconds() : 0) >
                      simulation.currentTime.toSeconds() ||
                  (schedule.departureTime ? schedule.departureTime?.toSeconds() : 0) >
                      simulation.currentTime.toSeconds()
        ) {
            return false;
        }

        // Calculate time left before this train exceeds its max waiting time at the station
        const timeLeft =
            this.trainTemplate.type.maxWaitingTime - this.position.station.currentExceedingTimeInSeconds(this);
        // Determine if the train should wait longer based on delay and priority
        if (
            timeLeft > 0 &&
            otherTrain.delay.UIDelayValue < timeLeft && // TODO - consider delayTimeInSeconds or some other metric #1
            otherTrain.trainTemplate.type.priority >= this.trainTemplate.type.priority
        ) {
            // If both trains are at the same station, consider their departure times to avoid excessive waiting
            if (otherTrain.position instanceof Track) {
                const trainStation = otherTrain.position.station;
                if (trainStation.name === this.position.station.name) {
                    const thisDepartureTime = trainStation.trainsSchedule
                        .get(this.trainTemplate)
                        ?.find((schedule) => schedule.satisfied === false)?.departureTime;
                    const otherDepartureTime = trainStation.trainsSchedule
                        .get(otherTrain.trainTemplate)
                        ?.find((schedule) => schedule.satisfied === false)?.departureTime;
                    if (thisDepartureTime && otherDepartureTime) {
                        const intervalBetweenDepartures =
                            thisDepartureTime.toSeconds() - otherDepartureTime.toSeconds();
                        if (
                            // If the interval is small and the other train has already waited significantly, do not wait longer
                            intervalBetweenDepartures >= 0 && // not neccessarily needed, but for clarity and versatility - shouldn't happen otherwise when used as intended
                            otherTrain.delay.currentWaitingTimeAtTheStationInSeconds >
                                Math.min(10, intervalBetweenDepartures)
                        ) {
                            return false;
                        } else if (intervalBetweenDepartures < 0) {
                            return false;
                        }
                    }
                }
            }
            return true;
        } else if (
            otherTrain.delay.UIDelayValue < timeLeft && // TODO - consider delayTimeInSeconds or some other metric #2
            otherTrain.trainTemplate.type.priority < this.trainTemplate.type.priority
        ) {
            // TODO - randomness; for now - priority really matters
            return false;
        } /*if (otherTrain.delay.delayTimeInSeconds >= timeLeft) */ else {
            return false;
        }
    }

    /** Test code - checking if the train exceeded max waiting time at the station */
    warnIfLateAtStation() {
        if (this.#position instanceof Track) {
            if (this.#position.station.currentExceedingTimeInSeconds(this) > 10 * 60) {
                const [delayedTrains, schedules] = this.#position.station.lateTrainsToArrive();
                const trainsToWaitFor = delayedTrains
                    .filter((t) => t !== this)
                    .filter((t) => this.shouldWaitLonger(t, schedules));

                console.warn(
                    `${simulation.currentTime} Train ${this.displayName()} at station ${
                        this.#position.station.name
                    } exceeded 10 minutes waiting at the station by ${
                        this.#position.station.currentExceedingTimeInSeconds(this) - 10 * 60
                    } seconds. at the station: ${
                        this.#position.station.name
                    } and is waiting for other trains: ${trainsToWaitFor
                        .map(
                            (t) =>
                                t.displayName() +
                                (this.#position as Track).station.trainsSchedule
                                    .get(t.trainTemplate)
                                    ?.find((s) => s.satisfied === false)?.arrivalTime
                        )
                        .join(", ")}.`
                );
            }
        }
    }

    /**
     * Destroys the train and removes it from the simulation
     */
    destroy() {
        this.#destroyed = true;
        if (this.#position instanceof Track) {
            this.#position.trainDepart();
        }
        simulation.removeTrain(this);
    }

    /**
     * Returns the display name of the train
     * @returns string display name
     */
    displayName(): string {
        return this.trainTemplate.displayName();
    }

    /**
     * Returns next schedules for train at its current station
     * @returns Array<TrainScheduleStep>
     */
    getNextSchedules(): TrainScheduleStep[] {
        let station = this.#position instanceof Track ? this.#position.station : this.#position.getTargetStation();
        let lastStopTime: number = simulation.currentTime.toSeconds();
        const results: TrainScheduleStep[] = [];
        while (true) {
            const schedules = station.trainsSchedule.get(this.trainTemplate);
            if (schedules === undefined) break;
            const schedule = schedules
                ?.filter((s) => (s.departureTime ? s.departureTime.toSeconds() > lastStopTime : s.arrivalTime !== null))
                .sort((a, b) => {
                    const timeA = a.departureTime
                        ? a.departureTime.toSeconds()
                        : a.arrivalTime
                        ? a.arrivalTime.toSeconds()
                        : Infinity;
                    const timeB = b.departureTime
                        ? b.departureTime.toSeconds()
                        : b.arrivalTime
                        ? b.arrivalTime.toSeconds()
                        : Infinity;
                    return timeA - timeB;
                })[0];
            if (!schedule) break;
            results.push(schedule);
            lastStopTime = schedule.departureTime === null ? lastStopTime : schedule.departureTime.toSeconds();
            if (schedule.nextStation === null) break;
            station = schedule.nextStation;
        }
        return results;
    }
  
    /*
     * Gets the current position of the train
     * @returns Position of the train - corrected if waiting for the station
     */
    getPosition(): Position {
        if (this.#isWaiting) {
            return this.#nextStation!.position;
        }
        if (this.#position instanceof TrainPositionOnRail) {
            return this.#position.getPosition();
        } else {
            return this.#position.getPosition();
        }
    }
}
