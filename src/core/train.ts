import { TrainPositionOnRail, type TrainPosition } from "./trainPosition";
import { TrainTemplate } from "./trainTemplate";
import { Track } from "./track";
import { simulation } from "./simulation";
import type { Station } from "./station";
import { Delay } from "../utils/delay";

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
    /** If waiting for the others */
    #isWaiting: boolean = false;
    /** If destroyed */
    #destroyed: boolean = false;

    constructor(track: Track, trainTemplate: TrainTemplate) {
        this.trainTemplate = trainTemplate;
        this.#position = track;
    }

    // TODO - make train speeds reduce before meeting stations
    step() {
        if (!this.#isWaiting) {
            this.move();
            this.handleNextStationArrival();
        } else {
            // the train is at the station - no movement
            this.handleNextStationArrival();
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

                // updating velocity based on acceleration
                this.#velocity = Math.min(
                    this.#position.rail.getMaxSpeed(this.#position.distance),
                    this.trainTemplate.type.maxVelocity,
                    this.#velocity + this.trainTemplate.type.acceleration * simulation.timeStep
                );
            } else {
                this.stop();
                this.#delay.userDelayHandle(simulation.timeStep);
            }
        }
    }

    /** Approaching the next station logic */
    handleNextStationArrival() {
        if (this.#nextStation) {
            if (!(this.#position instanceof TrainPositionOnRail)) return; // safety check
            const arrived = (this.#position as TrainPositionOnRail).distance >= this.#position.rail.length();

            // checking if the train reached its next station
            const nextSchedule = this.#nextStation.trainsSchedule.get(this.trainTemplate);
            if (arrived) {
                if (nextSchedule) {
                    const trackAtTheStation = this.#nextStation.assignTrack(nextSchedule.track);

                    if (trackAtTheStation == null) {
                        // cannot arrive at the station - track full; waiting
                        // Z jaką prędkością może czekać pociąg?
                        this.#isWaiting = true;
                        this.#delay.addConflictDelay(this.calculateConflictDelay());
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
     * Adds external delays
     * @param delaySeconds external delay time in seconds
     */
    addDelay(delaySeconds: number) {
        this.#delay.addDelay(delaySeconds);
    }

    /**
     * Changes Train velocity
     * @param newVelocity updated velocity
     */
    updateVelocity(newVelocity: number) {
        this.#velocity = newVelocity;
    }

    /**
     * Changes Train acceleration status
     * @param newAcceleration updated acceleration status
     */
    updateAcceleration(newAccelerationStatus: AccelerationStatus) {
        this.#acceleration = newAccelerationStatus;
    }

    /**
     * Calculates delay due to (track occupancy) conflicts at the next station
     * @returns delay time in seconds
     */
    calculateConflictDelay(): number {
        let conflictDelay: number = 0;
        if (this.#nextStation) {
            const trackNumber = this.#nextStation.trainsSchedule.get(this.trainTemplate)?.track.trackNumber;
            const trackTrain = this.#nextStation.tracks.find((t) => t.trackNumber === trackNumber)?.train;

            if (trackTrain) {
                let trackTrainSchedule = this.#nextStation!.trainsSchedule.get(trackTrain.trainTemplate);
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
    shouldWaitLonger(otherTrain: Train): boolean {
        // TODO - correct if needed
        const timeLeft =
            this.trainTemplate.type.maxWaitingTime -
            (this.#delay.currentWaitingTimeAtTheStationInSeconds + this.#delay.delayTimeInSeconds);
        if (
            timeLeft > 0 &&
            otherTrain.delay.delayTimeInSeconds < timeLeft &&
            otherTrain.trainTemplate.type.priority >= this.trainTemplate.type.priority
        ) {
            return true;
        } else if (
            otherTrain.delay.delayTimeInSeconds < timeLeft &&
            otherTrain.trainTemplate.type.priority < this.trainTemplate.type.priority
        ) {
            // TODO - randomness; for now - priority really matters
            return false;
        } /*if (otherTrain.delay.delayTimeInSeconds >= timeLeft) */ else {
            return false;
        }
    }

    set nextStation(station: Station | null) {
        this.#nextStation = station;
    }
    set position(newPosition: TrainPosition) {
        this.#position = newPosition;
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
