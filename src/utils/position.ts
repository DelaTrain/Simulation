import { headingDistanceTo, moveTo } from "geolocation-utils";

export class Position {
    #latitude: number;
    #longitude: number;

    constructor(latitude: number, longitude: number) {
        this.#latitude = latitude;
        this.#longitude = longitude;
    }

    get latitude() {
        return this.#latitude;
    }
    get longitude() {
        return this.#longitude;
    }

    toArray(): [number, number] {
        return [this.#latitude, this.#longitude];
    }

    static fromArray(arr: [number, number]): Position {
        return new Position(arr[0], arr[1]);
    }

    /**
     * @returns distance to other in meters
     */
    distanceTo(other: Position): number {
        return headingDistanceTo(this.toLatLon(), other.toLatLon()).distance;
    }

    protected toLatLon() {
        return { lat: this.#latitude, lon: this.#longitude };
    }

    /**
     * @param other position towards which to move
     * @param distance in meters
     */
    moveBy(other: Position, distance: number): Position {
        const moved = moveTo(this.toLatLon(), {
            heading: headingDistanceTo(this.toLatLon(), other.toLatLon()).heading,
            distance,
        });
        return new Position(moved.lat, moved.lon);
    }
}
