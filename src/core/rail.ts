import type { Position } from "../utils/position";
import type { Station } from "./station";

export class Rail {
    /** Intermediate positions between fromStation and toStation */
    #positions: Position[];
    #fromStation: Station;
    #toStation: Station;
    /** Array of max speeds for each segment between positions */
    #maxSpeeds: Array<number>;

    #distances: Array<number> = [];

    constructor(fromStation: Station, positions: Position[], toStation: Station, maxSpeeds: Array<number>) {
        this.#positions = positions;
        this.#fromStation = fromStation;
        this.#toStation = toStation;
        this.#maxSpeeds = maxSpeeds;
        this.#calculateDistances();
    }

    #calculateDistances() {
        const allPositions = this.allPositions();
        this.#distances = [...Array(allPositions.length - 1).keys()].map((i) =>
            allPositions[i].distanceTo(allPositions[i + 1])
        );
    }

    get positions() {
        return this.#positions;
    }
    get fromStation() {
        return this.#fromStation;
    }
    get toStation() {
        return this.#toStation;
    }

    /** Returns all positions including fromStation, intermediate positions and toStation */
    allPositions(): Position[] {
        return [this.#fromStation.position, ...this.#positions, this.#toStation.position];
    }

    /** Total length of the rail in meters */
    length(): number {
        return this.#distances.reduce((a, b) => a + b, 0);
    }

    /** Returns the segment index and the distance to the end of that segment for a given distance along the rail */
    findSegmentIndexAtDistance(distance: number): [number, number] {
        for (let i = 0; i < this.#distances.length; i++) {
            distance -= this.#distances[i];
            if (0 > distance) {
                return [i, distance];
            }
        }
        return [this.#distances.length - 1, 0];
    }

    /** Returns the Position at a given distance along the rail */
    findPositionAtDistance(distance: number): Position {
        const [segmentIndex, distanceToEnd] = this.findSegmentIndexAtDistance(distance);
        const segmentStartPosition = this.allPositions()[segmentIndex];
        const segmentEndPosition = this.allPositions()[segmentIndex + 1];
        const segmentLength = this.#distances[segmentIndex];
        const res = segmentStartPosition.moveBy(segmentEndPosition, segmentLength + distanceToEnd);
        return res;
    }

    /**
     * @param distance in meters
     * @returns max speed at selected point in m/s
     */
    getMaxSpeed(distance: number): number {
        const [segmentIndex, _] = this.findSegmentIndexAtDistance(distance);
        if (isNaN(this.#maxSpeeds[segmentIndex])) {
            console.error("Max speed is NaN!");
            console.log("maxSpeeds:", this.#maxSpeeds);
            console.log("positions:", this.#positions);
            console.log(
                "Max speed at distance",
                distance,
                "is",
                this.#maxSpeeds[segmentIndex],
                "for stations",
                this.#fromStation.name,
                "-",
                this.#toStation.name
            );
        }
        return this.#maxSpeeds[segmentIndex];
    }
}
