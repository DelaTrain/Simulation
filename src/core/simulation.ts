import { importedData, ImportedData } from "../utils/importer";
import type { Station } from "./station";
import "./train";
import type { Train } from "./train";
import type { Rail } from "./rail";
import { Time } from "../utils/time";
import type { TrainTemplate } from "./trainTemplate";
import SimulationEvent from "../utils/event";

export class Simulation {
    timeStep: number = 15; // in seconds
    currentTime: Time = new Time(0, 0, 0);
    autoRun: boolean = false;
    autoRunSpeed: number = 250; // in milliseconds

    stepEvent: SimulationEvent = new SimulationEvent();
    trainAddedEvent: SimulationEvent<Train> = new SimulationEvent();
    trainRemovedEvent: SimulationEvent<Train> = new SimulationEvent();

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
        this.trains = [];
        this.stations.forEach((station) => {
            station.reset();
        });
    }

    step() {
        this.currentTime.addSeconds(this.timeStep);
        this.stations.forEach((station) => {
            station.step();
        });
        this.trains.forEach((train) => {
            train.step();
        });
        this.stepEvent.emit();
    }

    runAutomatically() {
        if (!this.autoRun) return;
        this.step();
        setTimeout(() => this.runAutomatically(), this.autoRunSpeed);
    }

    addTrain(train: Train) {
        this.trains.push(train);
        this.trainAddedEvent.emit(train);
    }

    removeTrain(train: Train) {
        const index = this.trains.indexOf(train);
        if (index !== -1) {
            this.trains.splice(index, 1);
            this.trainRemovedEvent.emit(train);
        }
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
