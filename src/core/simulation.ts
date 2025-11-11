import { importedData, ImportedData } from "../utils/importer";
import type { Station } from "./station";
import "./train";
import type { Train } from "./train";
import type { Rail } from "./rail";
import { Time } from "../utils/time";
import type { TrainTemplate } from "./trainTemplate";
import SimulationEvent from "../utils/event";

const START_TIME = new Time(3, 30, 0);

export class Simulation {
    timeStep: number = 15; // in seconds
    currentTime: Time = START_TIME.copy();
    autoRun: boolean = false;
    autoRunSpeed: number = 0; // in milliseconds

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
        this.currentTime = START_TIME.copy();
        this.trains = [];
        this.stations.forEach((station) => {
            station.reset();
        });
    }

    step() {
        this.currentTime.addSeconds(this.timeStep);
        if (this.currentTime.toSeconds() >= 86400) {
            this.autoRun = false;
            return;
        }

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
