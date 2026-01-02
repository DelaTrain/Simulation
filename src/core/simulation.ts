import { ImportedData } from "../utils/importer";
import type { Station } from "./station";
import "./train";
import type { Train } from "./train";
import type { Rail } from "./rail";
import { Time } from "../utils/time";
import type { TrainTemplate } from "./trainTemplate";
import SimulationEvent from "../utils/event";

//export const START_TIME = new Time(3, 30, 0); // TODO - for the possibility of any START_TIME -> need to spawn trains at proper stations (other than their first station) if they start before START_TIME
export const START_TIME = new Time(0, 0, 0);

export interface SimulationState {
    timeStep: number; // in seconds
    currentTime: Time;
    autoRun: boolean;
    autoRunSpeed: number; // in milliseconds
    deltaTime: number;
}

export class Simulation implements SimulationState {
    timeStep: number = 15; // in seconds
    currentTime: Time = START_TIME.copy();
    autoRun: boolean = false;
    autoRunSpeed: number = 0; // in milliseconds

    stepEvent: SimulationEvent = new SimulationEvent();
    trainAddedEvent: SimulationEvent<Train> = new SimulationEvent();
    trainRemovedEvent: SimulationEvent<Train> = new SimulationEvent();
    resetEvent: SimulationEvent = new SimulationEvent();

    stations: Map<string, Station> = new Map();
    trains: Train[] = [];
    trainTemplates: TrainTemplate[] = [];
    // map from (JSON of tuple of station names in alphabetical order) to Rail
    rails: Map<string, Rail> = new Map();
    deltaTime: number = 0;
    lastStepTime: number = -1;

    constructor() {
        this.reset();
    }

    loadData(data: ImportedData) {
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
        this.resetEvent.emit();
    }

    step() {
        if (!this.canStep()) {
            this.autoRun = false;
            return;
        }
        this.currentTime.addSeconds(this.timeStep);

        this.stations.forEach((station) => {
            station.step();
        });
        this.trains.forEach((train) => {
            train.step();
        });
        this.stepEvent.emit();
    }

    canStep(): boolean {
        return this.currentTime.copy().addSeconds(this.timeStep).toSeconds() + this.timeStep < 86400;
    }

    runAutomatically() {
        if (!this.autoRun) return;
        const now = performance.now();
        if (now - this.lastStepTime > this.autoRunSpeed) {
            this.lastStepTime = now;
            this.step();
            this.deltaTime = performance.now() - now;
        }
        requestAnimationFrame(() => this.runAutomatically());
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

    getState(): SimulationState {
        return {
            timeStep: this.timeStep,
            currentTime: this.currentTime,
            autoRun: this.autoRun,
            autoRunSpeed: this.autoRunSpeed,
            deltaTime: this.deltaTime,
        };
    }

    setState(state: SimulationState) {
        this.timeStep = state.timeStep;
        this.currentTime = state.currentTime;
        this.autoRun = state.autoRun;
        this.autoRunSpeed = state.autoRunSpeed;
        this.deltaTime = state.deltaTime;
    }
}

export const simulation = new Simulation();
