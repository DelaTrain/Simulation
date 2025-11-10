import type { Position } from "../utils/position";
import type { Station } from "./station";

export class Rail {
    #positions: Position[];
    #fromStation: Station;
    #toStation: Station;

    #distances: Array<number> = [];

    constructor(fromStation: Station, positions: Position[], toStation: Station) {
        this.#positions = positions;
        this.#fromStation = fromStation;
        this.#toStation = toStation;
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

    allPositions(): Position[] {
        return [this.#fromStation.position, ...this.#positions, this.#toStation.position];
    }

    length(): number {
        return this.#distances.reduce((a, b) => a + b, 0);
    }

    findSegmentIndexAtDistance(distance: number): [number, number] {
        for (let i = 0; i < this.#distances.length; i++) {
            distance -= this.#distances[i];
            if (0 > distance) {
                return [i, distance];
            }
        }
        return [this.#distances.length - 1, 0];
    }

    findPositionAtDistance(distance: number): Position {
        const [segmentIndex, distanceToEnd] = this.findSegmentIndexAtDistance(distance);
        const segmentStartPos = this.allPositions()[segmentIndex];
        const segmentEndPos = this.allPositions()[segmentIndex + 1];
        const segmentLength = this.#distances[segmentIndex];
        const res = segmentStartPos.moveBy(segmentEndPos, segmentLength + distanceToEnd);
        return res;
    }
}
