import { Rail } from "../core/rail";
import { Station } from "../core/station";
import { TrainCategory } from "../core/trainCategory";
import { Position } from "./position";
import { TrainTemplate } from "../core/trainTemplate";
import { Time } from "./time";

function mapCategory(category: string) {
    switch (category) {
        case "Bus":
            return new TrainCategory("Bus", 0, 40, 16, 1);
        case "BUS":
            return new TrainCategory("BUS", 0, 40, 16, 1);
        case "R":
            return new TrainCategory("R", 1, 60, 33, 2);
        case "KS":
            return new TrainCategory("KS", 1, 60, 33, 2);
        case "KML":
            return new TrainCategory("KML", 1, 60, 33, 2);
        default:
            return new TrainCategory(category, 2, 80, 44, 3);
    }
}

export class ImportedData {
    #stations: Map<string, Station> = new Map();
    #trains: Array<TrainTemplate> = [];
    #rails: Map<string, Rail> = new Map();

    constructor(jsonData: any) {
        this.#importStations(jsonData.stations);
        this.#importRails(jsonData.rails);
        this.#importTrains(jsonData.trains);
    }

    #importStations(stations: any[]) {
        this.#stations = new Map(
            stations.map((station) => [
                station.name,
                new Station(station.name, new Position(station.location.latitude, station.location.longitude)),
            ])
        );
    }

    #importTrains(trains: any[]) {
        this.#trains = trains
            .map((t) => {
                if (t.stops.length < 2) throw new Error(`Train ${t.name} ${t.number} has less than 2 stops`);

                // skip trains that do not depart from their first station
                if (t.stops[0].departure_time == null) {
                    // TODO fix properly train reappearance e.g. after changing the country
                    return null;
                }

                const trainTemplate = new TrainTemplate(t.number, mapCategory(t.category), t.name);

                for (let i = 0; i < t.stops.length; i++) {
                    this.#importStop(t, i, trainTemplate);
                }

                return trainTemplate;
            })
            .filter((t) => t !== null);
    }

    #importRails(rails: any[]) {
        this.#rails = new Map(
            rails.map((r) => {
                const stationA = this.#stations.get(r.start_station);
                const stationB = this.#stations.get(r.end_station);

                if (!stationA || !stationB) {
                    throw new Error(`Invalid rail stations: ${r.start_station} -> ${r.end_station}`);
                }

                const positions = r.points.map((p: any) => new Position(p.latitude, p.longitude)).slice(1, -1);
                const maxSpeeds = r.max_speed.map((s: number) => s / 3.6) ?? [];
                return [
                    JSON.stringify([stationA.name, stationB.name]),
                    new Rail(stationA, positions, stationB, maxSpeeds),
                ];
            })
        );
    }

    #importStop(t: any, i: number, trainTemplate: TrainTemplate) {
        const stop_current = t.stops[i];

        // maybe not necessary but good for clarity; less chance of mistakes
        // null arrival/departure times for first/last stops for trains changing numbers and being treated as separate ones
        if (i == 0) {
            stop_current.arrival_time = null;
        } else if (i == t.stops.length - 1) {
            stop_current.departure_time = null;
        }

        const stop_next = i + 1 <= t.stops.length ? t.stops[i + 1] : null;

        const sc = this.#stations.get(stop_current.station_name);
        if (!sc) {
            throw new Error(`Train ${t.name} ${t.number} has invalid stop station: ${stop_current.station_name}`);
        }

        const track =
            stop_current.track != null
                ? sc.addTrack(stop_current.track.platform, stop_current.track.track)
                : sc.addTrack(0, "?");

        const arrival_time = stop_current.arrival_time == null ? null : Time.fromString(stop_current.arrival_time);
        const departure_time =
            stop_current.departure_time == null ? null : Time.fromString(stop_current.departure_time);

        if (i == 0) {
            if (departure_time == null) throw new Error(`Train ${t.name} ${t.number} has no departure_time`);
            sc.addStartingTrain(trainTemplate, departure_time, track);
        }
        const sn = this.#stations.get(stop_next?.station_name);

        let rail: Rail | null = null;
        if (sc && sn) {
            const stationsSorted = sc.name < sn.name ? [sc, sn] : [sn, sc];
            const stationKey = JSON.stringify([stationsSorted[0].name, stationsSorted[1].name]);
            rail = this.#rails.get(stationKey) ?? null;
            if (!rail) {
                rail = new Rail(stationsSorted[0], [], stationsSorted[1], [120 / 3.6]); // default max speed 120 km/h
                this.#rails.set(stationKey, rail);
            }
        }
        sc.addScheduleInfo(trainTemplate, track, arrival_time, departure_time, sn ?? null, rail);
    }

    get stations() {
        return this.#stations;
    }
    get trains() {
        return this.#trains;
    }
    get rails() {
        return this.#rails;
    }
}
