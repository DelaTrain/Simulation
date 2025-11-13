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
    #destroyed: boolean = false;

    constructor(track: Track, trainTemplate: TrainTemplate) {
        this.trainTemplate = trainTemplate;
        this.#position = track;
    }

    // TODO - make delay reduction visible by adjusting train speeds to be more accurate
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

    move() {
        if (this.#position instanceof TrainPositionOnRail) {
            // updating position based on velocity and acceleration
            this.#position.move(
                this.#velocity * simulation.timeStep +
                    0.5 * this.trainTemplate.type.acceleration * simulation.timeStep * simulation.timeStep
            );

            // updating velocity based on acceleration
            this.#velocity = Math.min(
                this.trainTemplate.type.maxVelocity,
                this.#velocity + this.trainTemplate.type.acceleration * simulation.timeStep
            );
        }
    }

    handleNextStationArrival() {
        if (this.#nextStation) {
            if (!(this.#position instanceof TrainPositionOnRail)) return; // safety check
            const arrived = (this.#position as TrainPositionOnRail).distance >= this.#position.rail.length();
            // checking if the train reached its next station
            const nextSchedule = this.#nextStation.trainsSchedule.get(this.trainTemplate);
            if (arrived && nextSchedule?.arrivalTime) {
                // TODO ^ - idk if it should be like this - depends on TrainPositionOnRail management
                const trackAtTheStation = this.#nextStation.assignTrack(this.trainTemplate, nextSchedule.track);
                if (trackAtTheStation == null) {
                    // cannot arrive at the station - track full; waiting
                    // Z jaką prędkością może czekać pociąg?
                    this.#isWaiting = true;
                    this.#delay.addConflictDelay(this.calculateConflictDelay());

                    return;
                } else {
                    this.#isWaiting = false;

                    this.#position = trackAtTheStation; // TrainPositionOnRail no longer useful
                    this.#position.trainArrival(this, nextSchedule.arrivalTime);
                    this.stop();
                    this.#nextStation = null;
                    this.#acceleration = AccelerationStatus.Constant;
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

    calculateConflictDelay(): number {
        let conflictDelay: number = 0;
        if (this.#nextStation) {
            const firstTrackTrain = this.#nextStation.tracks[0].train;
            if (firstTrackTrain) {
                let firstTrackTrainSchedule = this.#nextStation.trainsSchedule.get(firstTrackTrain.trainTemplate);
                if (firstTrackTrainSchedule) {
                    if (firstTrackTrainSchedule.departureTime) {
                        conflictDelay =
                            firstTrackTrainSchedule.departureTime.toSeconds() - simulation.currentTime.toSeconds();
                    }
                }
            }

            this.#nextStation.tracks.forEach((track) => {
                const trackTrain = track.train;
                if (trackTrain) {
                    let trackTrainSchedule = this.#nextStation!.trainsSchedule.get(trackTrain.trainTemplate);
                    if (trackTrainSchedule) {
                        if (trackTrainSchedule.departureTime) {
                            if (
                                trackTrainSchedule.departureTime.toSeconds() - simulation.currentTime.toSeconds() <
                                conflictDelay
                            ) {
                                conflictDelay =
                                    trackTrainSchedule.departureTime.toSeconds() - simulation.currentTime.toSeconds();
                            }
                        }
                    }
                }
            });
        }
        return conflictDelay;
    }

    stop() {
        this.#velocity = 0;
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

    shouldWaitLonger(otherTrain: Train): boolean {
        const timeLeft = this.trainTemplate.type.maxWaitingTime - this.#delay.currentWaitingTimeAtTheStationInSeconds;
        if (
            otherTrain.delay.delayTimeInSeconds < timeLeft &&
            otherTrain.trainTemplate.type.priority > this.trainTemplate.type.priority
        ) {
            return true;
        } else if (
            otherTrain.delay.delayTimeInSeconds < timeLeft &&
            otherTrain.trainTemplate.type.priority <= this.trainTemplate.type.priority
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
