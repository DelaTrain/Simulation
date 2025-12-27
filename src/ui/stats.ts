import Chart from "chart.js/auto";

import { simulation } from "../core/simulation";
import type { Time } from "../utils/time";
import { Track } from "../core/track";

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

        // calculate average latency only for trains that are at stations (i.e. their position is Track) - because only those trains have meaningful delay values
        const trainsCountedInTermsOfDelay = aliveTrains.filter((train) => train.position instanceof Track);
        const latency =
            trainsCountedInTermsOfDelay.reduce((sum, train) => {
                return sum + train.delay.UIDelayValue;
            }, 0) / Math.max(trainsCountedInTermsOfDelay.length, 1); // average latency
        this.averageLatency.push(latency / 60); // in minutes

        // record time step
        this.timeSteps.push(simulation.currentTime);
    }

    resetStats() {
        this.trainsAlive = [];
        this.averageLatency = [];
    }
}

export const statsCollector = new StatsCollector();

class StatsPanel {
    element: HTMLDivElement;
    contentEle: HTMLDivElement;
    titleEle: HTMLHeadingElement;
    trainsAliveChart: StatsChart | undefined;
    totalLatencyChart: StatsChart | undefined;

    constructor() {
        this.element = document.getElementById("panel") as HTMLDivElement;
        this.titleEle = document.getElementById("panel-title") as HTMLHeadingElement;
        this.contentEle = document.getElementById("panel-content") as HTMLDivElement;
        const showBtn = document.getElementById("stats-button") as HTMLButtonElement;

        showBtn.addEventListener("click", () => {
            this.show();
        });

        const closeButton = document.getElementById("panel-close") as HTMLButtonElement;
        closeButton.addEventListener("click", () => {
            this.hide();
        });
    }

    show() {
        this.updateDisplay();
        this.element.style.display = "block";
        this.titleEle.innerText = "Simulation statistics";
        this.contentEle.innerHTML = "";

        this.trainsAliveChart = new StatsChart("Number of trains on the map");
        this.trainsAliveChart.addToPanel(this);
        this.trainsAliveChart.updateData(statsCollector.trainsAlive);
        this.totalLatencyChart = new StatsChart("Average train delay (counted for trains at stations) [min]");
        this.totalLatencyChart.addToPanel(this);
        this.totalLatencyChart.updateData(statsCollector.averageLatency);
        simulation.stepEvent.subscribe(this.updateDisplay.bind(this));
    }

    hide() {
        this.element.style.display = "none";
        simulation.stepEvent.unsubscribe(this.updateDisplay.bind(this));
    }

    updateDisplay() {
        if (this.trainsAliveChart) {
            this.trainsAliveChart.updateData(
                statsCollector.trainsAlive,
                statsCollector.timeSteps.map((t) => t.toString())
            );
        }
        if (this.totalLatencyChart) {
            this.totalLatencyChart.updateData(
                statsCollector.averageLatency,
                statsCollector.timeSteps.map((t) => t.toString())
            );
        }
    }
}

class StatsChart {
    canvas: HTMLCanvasElement;
    chart: any;

    constructor(title: string) {
        this.canvas = document.createElement("canvas");
        this.canvas.width = 400;
        this.canvas.height = 200;

        const data = {
            labels: [1],
            datasets: [
                {
                    label: title,
                    data: [1],
                    borderColor: "rgba(75, 192, 192, 1)",
                    backgroundColor: "rgba(75, 192, 192, 0.2)",
                    fill: true,
                    pointRadius: 0,
                },
            ],
        };
        this.chart = new Chart(this.canvas, {
            type: "line",
            data,
            options: {
                animation: false,
            },
        });
    }

    addToPanel(panel: StatsPanel) {
        panel.contentEle.appendChild(this.canvas);
        this.chart.update();
    }

    updateData(data: number[], labels?: string[]) {
        this.chart.data.datasets[0].data = data;
        if (labels) {
            this.chart.data.labels = labels;
        } else {
            this.chart.data.labels = data.map((_, index) => index.toString());
        }
        this.chart.update();
    }
}

export const statsPanel = new StatsPanel();
