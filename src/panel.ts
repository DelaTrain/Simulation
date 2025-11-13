import { simulation } from "./core/simulation";
import { Station } from "./core/station";
import { Track } from "./core/track";
import { Train } from "./core/train";
import { createButton } from "./utils/button";

class UiPanel {
    element: HTMLDivElement;
    content: Train | Station | null;
    title: HTMLHeadingElement;
    contentEle: HTMLDivElement;

    constructor() {
        this.element = document.getElementById("panel") as HTMLDivElement;
        this.title = this.element.querySelector("#panel-title") as HTMLHeadingElement;
        this.contentEle = this.element.querySelector("#panel-content") as HTMLDivElement;

        const closeButton = document.getElementById("panel-close") as HTMLButtonElement;
        closeButton.addEventListener("click", () => {
            this.hide();
            this.content = null;
        });
        simulation.stepEvent.subscribe(this.updateDisplay.bind(this));
        simulation.resetEvent.subscribe(this.updateDisplay.bind(this));

        this.element.style.display = "none";
        this.content = null;
    }

    show() {
        this.element.style.display = "block";
    }

    hide() {
        this.element.style.display = "none";
    }

    display(content: Train | Station) {
        if (this.content === content) {
            this.hide();
            this.content = null;
            return;
        }

        if (content instanceof Train) {
            this.displayTrain(content);
        } else {
            this.displayStation(content);
        }

        this.content = content;
        this.show();
    }

    updateDisplay() {
        if (this.content instanceof Train) {
            if (this.content.destroyed) {
                this.hide();
                this.content = null;
                return;
            }
            this.displayTrain(this.content);
        } else if (this.content instanceof Station) {
            this.displayStation(this.content);
        }
    }

    displayTrain(train: Train) {
        this.title.textContent = `Train ${train.displayName()}`;
        this.contentEle.innerHTML = `
            <p><strong>Speed:</strong> ${train.velocity.toFixed(2)} m/s</p>
            <p><strong>Delay:</strong> ${(train.delay.delayTimeInSeconds / 60).toFixed(2)} min</p>
        `;
        this.contentEle.appendChild(
            createButton("Add 5 min delay", () => {
                train.delay.addDelay(300);
                this.updateDisplay();
            })
        );
        if (train.position instanceof Track) {
            this.contentEle.appendChild(
                createButton("Show station", () => {
                    this.display((train.position as Track).station);
                })
            );
        }
    }

    displayStation(station: Station) {
        this.title.textContent = `Station: ${station.name}`;
        const tracks = station.tracks
            .sort((a, b) => {
                if (a.platformNumber === b.platformNumber) {
                    return a.trackNumber.localeCompare(b.trackNumber);
                }
                return a.platformNumber - b.platformNumber;
            })
            .map(
                (track) =>
                    `<tr><th>${track.platformNumber} (${track.trackNumber})</th><td>${
                        track.currentOccupancy === null ? " - " : track.currentOccupancy.displayName()
                    }</td><td>${
                        station.nextArrivalForTrack(track, simulation.currentTime)?.displayArrival() ?? " - "
                    }</td><td>${
                        station.nextDepartureForTrack(track, simulation.currentTime)?.displayDeparture() ?? " - "
                    }</td></tr>`
            )
            .join("");
        this.contentEle.innerHTML = `
        <table>
        <tr><th>Platform</th><th>Occupancy</th><th>Arrival</th><th>Departure</th></tr>
        ${tracks}
        </table>`;
    }
}

export const uiPanel = new UiPanel();
