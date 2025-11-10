import { importedData, ImportedData } from "../utils/importer";
import type { Station } from "./station";
import "./train";
import type { Train } from "./train";
import type { Rail } from "./rail";
import { updateTime } from "../app";
import { Time } from "../utils/time";
import type { TrainTemplate } from "./trainTemplate";

export class Simulation {
    timeStep: number = 15; // in seconds
    currentTime: Time = new Time(0, 0, 0);
    autoRun: boolean = false;
    autoRunSpeed: number = 250; // in milliseconds

    stations: Map<string, Station>;
    trains: Train[] = [];
    trainTemplates: TrainTemplate[] = [];
    rails: Set<Rail>;

    constructor(data: ImportedData) {
        this.stations = data.stations;
        this.trainTemplates = data.trains;
        this.rails = data.rails;
        this.reset();
    }

    reset() {
        this.currentTime = new Time(0, 0, 0);
        // TODO: reset trains, stations, etc.
    }

    step() {
        this.currentTime.addSeconds(this.timeStep);
    }

    runAutomatically() {
        if (!this.autoRun) return;
        this.step();
        setTimeout(() => this.runAutomatically(), this.autoRunSpeed);
    }
}

/*
        First version goals:
            * delays creating by clicking
            * train delays propagation
                - waiting for train transfers
                    from delayed ones
                    (probablistic, by the TrainType/ time)
                - next delays beacuse of the previous ones
                - platforms limitiations
            * delays in times by stations graphs
            * delay range on the map (?)
*/

export const simulation = new Simulation(importedData);
