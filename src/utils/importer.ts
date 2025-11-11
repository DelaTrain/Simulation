import { Rail } from "../core/rail";
import { Station } from "../core/station";
import { TrainCategory } from "../core/trainCategory";
import { Position } from "./position";
import DATA from "../../data/delatrain.json";
import { TrainTemplate } from "../core/trainTemplate";
import { Time } from "./time";

function mapCategory(category: string) {
    switch (category) {
        case "Bus":
            return new TrainCategory("Bus", 0, 40, 80, 1);
        case "R":
            return new TrainCategory("R", 1, 60, 120, 2);
        case "KS":
            return new TrainCategory("KS", 1, 60, 120, 2);
        default:
            return new TrainCategory(category, 2, 80, 160, 3);
    }
}

export class ImportedData {
    #stations: Map<string, Station> = new Map();
    #trains: Array<TrainTemplate> = [];
    #rails: Set<Rail> = new Set();

    constructor(jsonData: any) {
        this.#importStations(jsonData.stations);
        this.#importTrains(jsonData.trains);
    }

    #importStations(stations: any[]) {
        this.#stations = new Map(
            stations.map((station) => [
                station.name,
                new Station(station.name, new Position(station.latitude, station.longitude)),
            ])
        );
    }

    #importTrains(trains: any[]) {
        this.#trains = trains.map((t) => {
            const trainTemplate = new TrainTemplate(t.number, mapCategory(t.category), t.name);

            if (t.stops.length < 2) throw new Error(`Train ${t.name} ${t.number} has less than 2 stops`);

            for (let i = 0; i < t.stops.length; i++) {
                this.#importStop(t, i, trainTemplate);
            }

            return trainTemplate;
        });
    }

    #importStop(t: any, i: number, trainTemplate: TrainTemplate) {
        const stop_current = t.stops[i];
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
        const rail = sn ? new Rail(sc, [], sn) : null;
        if (rail) {
            this.#rails.add(rail);
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

export const importedData = new ImportedData(DATA);
