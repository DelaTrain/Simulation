import Chart from "chart.js/auto";

import { simulation } from "../core/simulation";
import type { Time } from "../utils/time";

class StatsCollector {
    trainsAlive: Array<number> = [];
    totalLatency: Array<number> = []; // in minutes
    timeSteps: Array<Time> = [];

    constructor() {
        simulation.stepEvent.subscribe(this.collectStats.bind(this));
        simulation.resetEvent.subscribe(this.resetStats.bind(this));
    }

    collectStats() {
        const aliveTrains = simulation.trains.filter((train) => !train.destroyed).length;
        this.trainsAlive.push(aliveTrains);

        const latency = simulation.trains.reduce((sum, train) => {
            return sum + (!train.destroyed ? train.delay.delayTimeInSeconds : 0);
        }, 0);
        this.totalLatency.push(latency / 60); // in minutes

        this.timeSteps.push(simulation.currentTime);
    }

    resetStats() {
        this.trainsAlive = [];
        this.totalLatency = [];
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
        this.titleEle.innerText = "Statystyki symulacji";
        this.contentEle.innerHTML = "";

        this.trainsAliveChart = new StatsChart("Liczba żywych pociągów");
        this.trainsAliveChart.addToPanel(this);
        this.trainsAliveChart.updateData(statsCollector.trainsAlive);
        this.totalLatencyChart = new StatsChart("Całkowite opóźnienie pociągów");
        this.totalLatencyChart.addToPanel(this);
        this.totalLatencyChart.updateData(statsCollector.totalLatency);
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
                statsCollector.totalLatency,
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
