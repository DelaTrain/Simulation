import { TrainPositionOnRail, type TrainPosition } from "./trainPosition";
import { TrainTemplate } from "./trainTemplate";
import { Track } from "./track";
import { simulation } from "./simulation";
import type { Station } from "./station";
import { Delay } from "../utils/delay";
import type { TrainScheduleStep } from "./trainScheduleStep";

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
    /** train speed value - meters per second */
    #velocity: number = 0;
    /** train acceleration value */
    #acceleration: AccelerationStatus = AccelerationStatus.Accelerating;
    /** contains distance and rail number */
    #position: TrainPosition;
    /** individual time of being late */
    #delay: Delay = new Delay();
    /** Next Station */
    #nextStation: Station | null = null;
    /** If waiting for the others or for the station */
    #isWaiting: boolean = false;
    /** If destroyed */
    #destroyed: boolean = false;

    constructor(track: Track, trainTemplate: TrainTemplate) {
        this.trainTemplate = trainTemplate;
        this.#position = track;
    }

    // TODO - make train speeds reduce before meeting stations - in progress
    // TODO - display delays greater than limit
    // TODO - think about delay calculations when moving between stations
    step() {
        if (!this.#isWaiting) {
            this.move();
            this.handleNextStationArrival();
        } else {
            // the train is at/before the station - no movement
            this.handleNextStationArrival();
        }

        // test code - checking if the train exceeded max waiting time at the station
        if (this.#position instanceof Track) {
            /*if (this.#position.station.currentExceedingTimeInSeconds(this) > this.trainTemplate.type.maxWaitingTime) {
                console.warn(
                    `${simulation.currentTime} Train ${this.displayName()} at station ${
                        this.#position.station.name
                    } exceeded max waiting time (${this.trainTemplate.type.maxWaitingTime}) at the station by ${
                        this.#position.station.currentExceedingTimeInSeconds(this) -
                        this.trainTemplate.type.maxWaitingTime
                    } seconds.`
                );
            }*/
            if (this.number === 5303) {
                console.log(
                    `${simulation.currentTime} Train ${this.displayName()} at station ${
                        this.#position.station.name
                    } waiting for ${this.#position.station.currentExceedingTimeInSeconds(this)} seconds.`
                );
            }
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
                                schedules.get(t.trainTemplate)?.find((s) => s.satisfied === false)?.arrivalTime
                        )
                        .join(", ")}.`
                );
            }
        }
    }

    /**
     * Train movement logic
     */
    move() {
        if (this.#position instanceof TrainPositionOnRail) {
            // updating position based on velocity and acceleration
            if (this.#delay.dUserAlreadyHandled()) {
                this.#position.move(
                    this.#velocity * simulation.timeStep +
                        0.5 * this.trainTemplate.type.acceleration * simulation.timeStep * simulation.timeStep
                );

                this.#updateVelocity();
            } else {
                this.stop();
                this.#delay.userDelayHandle(simulation.timeStep);
            }
        }
    }

    /**
     * Updates the train velocity based on acceleration and next station proximity
     */
    #updateVelocity() {
        if (this.#position instanceof TrainPositionOnRail) {
            const velocityForcedByNextStation = this.calculateArrivingVelocity();
            const previousVelocity = this.#velocity;
            this.#velocity = Math.min(
                this.#position.rail.getMaxSpeed(this.#position.distance),
                this.trainTemplate.type.maxVelocity,
                this.#velocity + this.trainTemplate.type.acceleration * simulation.timeStep
                //velocityForcedByNextStation !== null ? velocityForcedByNextStation : Infinity // TODO - in progress
            );

            // updating acceleration status
            if (this.#velocity < previousVelocity) {
                this.#acceleration = AccelerationStatus.Decelerating;
            } else if (this.#velocity > previousVelocity) {
                this.#acceleration = AccelerationStatus.Accelerating;
            } else {
                this.#acceleration = AccelerationStatus.Constant;
            }
        }
    }

    /** Approaching the next station logic */
    handleNextStationArrival() {
        if (this.#nextStation) {
            if (!(this.#position instanceof TrainPositionOnRail)) return; // safety check
            const arrived = (this.#position as TrainPositionOnRail).distance >= this.#position.rail.length();

            // checking if the train reached its next station
            const nextSchedule = this.#nextStation.trainsSchedule
                .get(this.trainTemplate)
                ?.find((schedule) => schedule.satisfied === false);
            if (arrived) {
                if (nextSchedule) {
                    if (nextSchedule.arrivalTime) {
                        if (simulation.currentTime.toSeconds() < nextSchedule.arrivalTime.toSeconds()) {
                            // early arrival - wait before entering the station
                            this.stop();
                            this.#isWaiting = true;
                            return;
                        }
                    }
                    const trackAtTheStation = this.#nextStation.assignTrack(nextSchedule.track);

                    if (trackAtTheStation == null) {
                        if (this.number === 5620) {
                            console.log(
                                `${simulation.currentTime} Train ${this.displayName()} cannot arrive at station ${
                                    this.#nextStation.name
                                } - track full.`
                            );
                        }

                        // cannot arrive at the station - track full; waiting
                        this.stop();
                        this.#isWaiting = true;
                        //this.#delay.addConflictDelay(this.calculateConflictDelay());
                        return;
                    } else {
                        this.#isWaiting = false;
                        this.#position = trackAtTheStation; // TrainPositionOnRail no longer useful
                        this.#nextStation = null;

                        // only if this is a real stop
                        if (nextSchedule.arrivalTime) {
                            this.stop();
                        }

                        this.#position.trainArrival(this, nextSchedule.arrivalTime);

                        if (this.number === 5620) {
                            const nextArrivalTime = nextSchedule.nextStation
                                ? nextSchedule.nextStation.trainsSchedule
                                      .get(this.trainTemplate)
                                      ?.find((schedule) => schedule.satisfied === false)?.arrivalTime || "N/A"
                                : "N/A";
                            console.log(
                                `${simulation.currentTime} Train ${this.displayName()} arrived at station ${
                                    this.#position.station.name
                                } on track ${this.#position.trackNumber}. Next station: ${
                                    nextSchedule.nextStation?.name || "N/A"
                                } at ${nextArrivalTime}.`
                            );
                        }
                    }
                } else {
                    throw new Error("Train schedule missing for the next station");
                }
            }
        } else {
            // despawning in the station logic, if nextStation is null
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
            } else if (this.trainTemplate.type.maxVelocity < 44 && this.distanceToNextStation! < 3000) {
                velocity -= (0.5 + Math.random() * (0.7 - 0.5)) * simulation.timeStep;
            } else if (this.trainTemplate.type.maxVelocity < 56 && this.distanceToNextStation! < 6000) {
                velocity -= (0.4 + Math.random() * (0.5 - 0.4)) * simulation.timeStep;
            } else if (this.distanceToNextStation! < 2000) {
                velocity -= (0.3 + Math.random() * (0.5 - 0.3)) * simulation.timeStep;
            }
            return Math.max(velocity, 6); // minimum arriving speed 6 m/s (21.6 km/h)
        }
        return null;
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

    stop() {
        this.#velocity = 0;
        this.#acceleration = AccelerationStatus.Constant;
    }

    destroy() {
        this.#destroyed = true;
        if (this.#position instanceof Track) {
            this.#position.trainDepart();
        }
        simulation.removeTrain(this);
    }

    displayName(): string {
        return this.trainTemplate.displayName();
    }

    /**
     * Determines if the train should wait longer at the station for other trains with specific priorities
     * @param otherTrain train to wait for (or not to wait for)
     * @returns boolean indicating whether to wait longer
     */
    shouldWaitLonger(otherTrain: Train, schedules: Map<TrainTemplate, Array<TrainScheduleStep>>): boolean {
        const schedule = schedules.get(otherTrain.trainTemplate)?.find((s) => s.satisfied === false);
        if (!schedule) {
            return false;
        } else if (
            schedule.arrivalTime
                ? schedule.arrivalTime?.toSeconds()
                : (schedule.departureTime ? schedule.departureTime.toSeconds() : 0) > simulation.currentTime.toSeconds()
        ) {
            return false;
        }
        if (this.position instanceof Track) {
            // TODO - correct if needed
            const timeLeft =
                this.trainTemplate.type.maxWaitingTime - this.position.station.currentExceedingTimeInSeconds(this);
            if (
                timeLeft > 0 &&
                otherTrain.delay.UIDelayValue < timeLeft && // TODO - consider delayTimeInSeconds or some other metric
                otherTrain.trainTemplate.type.priority >= this.trainTemplate.type.priority
            ) {
                /*if (otherTrain.trainTemplate.number === 40653 || otherTrain.trainTemplate.number === 44153) {
                console.warn("Debug info for train", otherTrain.trainTemplate.number, "at shouldWaitLonger:", {
                    thisTrain: this.trainTemplate.number,
                    otherTrain: otherTrain.trainTemplate.number,
                    timeLeft: timeLeft,
                    otherTrainDelay: otherTrain.delay.delayTimeInSeconds,
                    otherTrainPriority: otherTrain.trainTemplate.type.priority,
                    thisTrainPriority: this.trainTemplate.type.priority,
                });
            }*/ // TODO - weird priority value changes for some trains - investigate

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
                                otherTrain.delay.currentWaitingTimeAtTheStationInSeconds >
                                Math.min(10, intervalBetweenDepartures)
                            ) {
                                return false;
                            }
                        }
                    }
                }

                return true;
            } else if (
                otherTrain.delay.UIDelayValue < timeLeft &&
                otherTrain.trainTemplate.type.priority < this.trainTemplate.type.priority
            ) {
                // TODO - randomness; for now - priority really matters
                return false;
            } /*if (otherTrain.delay.delayTimeInSeconds >= timeLeft) */ else {
                return false;
            }
        } else {
            return false;
        }
    }

    set nextStation(station: Station | null) {
        this.#nextStation = station;
    }
    set position(newPosition: TrainPosition) {
        this.#position = newPosition;
    }

    get distanceToNextStation(): number | null {
        if (this.#position instanceof TrainPositionOnRail) {
            return this.#position.getDistanceToNextStation();
        }
        return null;
    }

    get destroyed() {
        return this.#destroyed;
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
}
