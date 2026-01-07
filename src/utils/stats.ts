import { simulation } from "../core/simulation";
import type { Time } from "../utils/time";
import { Track } from "../core/track";

export type StatsKey = "trainsAlive" | "averageLatency";

class StatsCollector {
    trainsAlive: Array<number> = [];
    averageLatency: Array<number> = []; // in minutes
    timeSteps: Array<Time> = [];

    constructor() {
        simulation.stepEvent.subscribe(this.collectStats.bind(this));
        simulation.resetEvent.subscribe(this.resetStats.bind(this));
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
    }

    resetStats() {
        this.trainsAlive = [];
        this.averageLatency = [];
        this.timeSteps = [];
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
}

export const statsCollector = new StatsCollector();
