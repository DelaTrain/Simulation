import { simulation } from "../core/simulation";
import type { Time } from "../utils/time";
import { Track } from "../core/track";
import type { Station } from "../core/station";

export type StatsKey = "trainsAlive" | "averageLatency";

class StatsCollector {
    trainsAlive: Array<number> = [];
    averageLatency: Array<number> = []; // in minutes
    timeSteps: Array<Time> = [];
    stationsStats: Map<string, StationStatsCollector> = new Map();

    constructor() {
        simulation.stepEvent.subscribe(this.collectStats.bind(this));
        simulation.resetEvent.subscribe(this.resetStats.bind(this));
    }

    switchCollectStatsForStation(station: Station, collect: boolean) {
        if (!this.stationsStats.has(station.name) && collect) {
            this.stationsStats.set(station.name, new StationStatsCollector(station));
        } else if (this.stationsStats.has(station.name) && !collect) {
            this.stationsStats.delete(station.name);
        }
    }

    collectStats() {
        const aliveTrains = simulation.trains.filter((train) => !train.destroyed);
        const aliveTrainsNumber = aliveTrains.length;
        this.trainsAlive.push(aliveTrainsNumber);

        // calculate average latency for trains
        // TODO - think if there are better ways? - calculate by collecting data from a period of time instead of single step
        const trainsCountedInTermsOfDelay = aliveTrains.filter((train) => train.position instanceof Track);
        const latency =
            aliveTrains.reduce((sum, train) => {
                return sum + train.delay.UIDelayValue;
            }, 0) / Math.max(aliveTrains.length, 1); // average latency
        this.averageLatency.push(latency / 60); // in minutes

        // record time step
        this.timeSteps.push(simulation.currentTime.copy());

        // collect stats for each station
        this.stationsStats.forEach((collector) => {
            collector.collectStats();
        });
    }

    resetStats() {
        this.trainsAlive = [];
        this.averageLatency = [];
        this.timeSteps = [];
        this.stationsStats.forEach((collector) => {
            collector.resetStats();
        });
    }

    totalStats() {
        let totalTrainsAlive = 0;
        let totalAverageLatency = 0;
        let totalTime = 0;
        for (let i = 1; i < this.timeSteps.length; i++) {
            const td = this.timeSteps[i].toSeconds() - this.timeSteps[i - 1].toSeconds();
            totalTrainsAlive += this.trainsAlive[i] * td;
            totalAverageLatency += this.averageLatency[i] * td;
            totalTime += td;
        }
        return {
            trainsAlive: totalTrainsAlive / totalTime,
            averageLatency: totalAverageLatency / totalTime,
        };
    }

    isCollectingStatsForStation(station: Station): boolean {
        return this.stationsStats.has(station.name);
    }
}

export type StationStatsKey = "trainsArrived" | "trainsDeparted" | "trainsInStation" | "trainsDelayed" | "sumOfDelays";

class StationStatsCollector {
    station: Station;
    trainsArrived: Array<number> = [];
    trainsDeparted: Array<number> = [];
    trainsInStation: Array<number> = [];
    trainsDelayed: Array<number> = [];
    sumOfDelays: Array<number> = [];
    timeSteps: Array<Time> = [];

    constructor(station: Station) {
        this.station = station;
        simulation.stepEvent.subscribe(this.collectStats.bind(this));
        simulation.resetEvent.subscribe(this.resetStats.bind(this));
    }

    collectStats() {
        const schedules = Array.from(this.station.trainsSchedule.values()).flatMap((sch) => sch);
        const arrived = schedules.filter((sch) => sch.realArrivalTime !== null).length;
        const departed = schedules.filter((sch) => sch.realDepartureTime !== null).length;
        const inStation = this.station.tracks.filter((track) => track.train !== null).length;
        const delayedTrains = schedules.filter((sch) => {
            const train = sch.train.train;
            return train !== null && train.delay.UIDelayValue > 0 && !train.destroyed;
        });
        const delayedCount = delayedTrains.length;
        const totalDelay = delayedTrains.reduce((sum: number, sch) => {
            const train = sch.train.train;
            return sum + (train ? train.delay.UIDelayValue : 0);
        }, 0);

        this.trainsArrived.push(arrived);
        this.trainsDeparted.push(departed);
        this.trainsInStation.push(inStation);
        this.trainsDelayed.push(delayedCount);
        this.sumOfDelays.push(totalDelay / 60); // in minutes
        this.timeSteps.push(simulation.currentTime.copy());
    }

    resetStats() {
        this.trainsArrived = [];
        this.trainsDeparted = [];
        this.trainsInStation = [];
        this.trainsDelayed = [];
        this.sumOfDelays = [];
        this.timeSteps = [];
    }
}

export const statsCollector = new StatsCollector();
