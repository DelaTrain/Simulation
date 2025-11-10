import { ImportedData } from "../utils/importer";
import type { Station } from "./station";
import "./train";
import type { Train } from "./train";
import DATA from "../../data/delatrain.json";
import type { Rail } from "./rail";
import { updateTime } from "../app";
import { Time } from "../utils/time";
import type { TrainTemplate } from "./trainTemplate";

export class Simulation {
    timeStep: number = 15; // in seconds
    currentTime: Time = new Time(0, 0, 0);
    autorun: boolean = false;
    autorunSpeed: number = 250; // in milliseconds

    stations: Map<string, Station>;
    trains: Train[] = [];
    trainsUnspawned: TrainTemplate[] = [];
    rails: Set<Rail>;

    constructor(data: ImportedData) {
        this.stations = data.stations;
        //this.trainsUnspawned = data.trains; // TODO: przepisać importer, @Kacper0510
        this.rails = data.rails;
        // this.#resetTime(); // TODO
    }

    step() {
        this.currentTime.addSeconds(this.timeStep);
    }

    runAutomatically() {
        if (!this.autorun) return;
        this.step();
        setTimeout(() => this.runAutomatically(), this.autorunSpeed);
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

const importedData = new ImportedData(DATA);
export const simulation = new Simulation(importedData);
