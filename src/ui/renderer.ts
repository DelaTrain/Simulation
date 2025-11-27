import type { Simulation } from "../core/simulation";
import * as L from "leaflet";
import "leaflet.heat/dist/leaflet-heat.js";
import "leaflet/dist/leaflet.css";
import type { Station } from "../core/station";
import type { Rail } from "../core/rail";
import type { Train } from "../core/train";
import { uiPanel } from "./panel";
import { mapValue } from "../utils/math";
import { Track } from "../core/track";

const stationIcon = L.divIcon({ className: "station-icon" });
const trainIcon = L.divIcon({ className: "train-icon" });
const MIN_RENDER_DELAY_SECONDS = 30;
const MAX_DELAY_SECONDS = 3600;
const MAX_HEATMAP_INTENSITY = 1.0;
const ENABLE_HEATMAP = false;

const colorScale = (value: number): string => {
    const clampedValue = Math.max(0, Math.min(1, value));
    const hue = Math.floor(120 * (1 - clampedValue));
    return `hsl(${hue}, 100%, 50%)`;
};

export class Renderer {
    map: L.Map;
    trainMarkers: Map<Train, L.Marker>;
    stationMarkers: Map<Station, L.Marker>;
    railLines: Map<Rail, L.Polyline>;
    heatmap: any;

    constructor(protected simulation: Simulation) {
        this.simulation.stepEvent.subscribe(this.update.bind(this));
        this.simulation.trainAddedEvent.subscribe(this.trainAdded.bind(this));
        this.simulation.trainRemovedEvent.subscribe(this.trainRemoved.bind(this));
        this.simulation.resetEvent.subscribe(this.reset.bind(this));

        this.map = L.map("map").setView([50.061389, 19.938333], 12);
        this.trainMarkers = new Map();
        this.stationMarkers = new Map();
        this.railLines = new Map();
        this.setup();
    }

    setup() {
        L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
            maxZoom: 19,
            attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        }).addTo(this.map);
        if (ENABLE_HEATMAP)
            this.heatmap = (L as any).heatLayer([], { radius: 50, blur: 50, maxZoom: 1 }).addTo(this.map);
        this.initialDraw();
    }

    initialDraw() {
        this.simulation.rails.forEach((rail) => {
            this.displayRail(rail);
        });

        this.simulation.stations.forEach((station) => {
            this.displayStation(station);
        });

        this.simulation.trains.forEach((train) => {
            this.displayTrain(train);
        });
    }

    reset() {
        this.trainMarkers.forEach((marker) => {
            this.map.removeLayer(marker);
        });
        this.trainMarkers.clear();

        this.stationMarkers.forEach((marker) => {
            this.map.removeLayer(marker);
        });
        this.stationMarkers.clear();

        this.railLines.forEach((polyline) => {
            this.map.removeLayer(polyline);
        });
        this.railLines.clear();

        this.initialDraw();
    }

    update() {
        const heatmap = this.simulation.trains
            .map((train) => {
                const marker = this.trainMarkers.get(train);
                if (marker) {
                    marker.setLatLng(train.position.getPosition().toArray());
                    marker.getElement()!.style.backgroundColor = colorScale(
                        mapValue(0, MAX_DELAY_SECONDS, train.delay.UIDelayValue)
                    );
                    if (ENABLE_HEATMAP)
                        if (train.delay.UIDelayValue > MIN_RENDER_DELAY_SECONDS) {
                            return [
                                train.position.getPosition().latitude,
                                train.position.getPosition().longitude,
                                train.delay.UIDelayValue * MAX_HEATMAP_INTENSITY,
                            ];
                        }
                }
                return null;
            })
            .filter((item) => item !== null);
        if (ENABLE_HEATMAP) this.heatmap.setLatLngs(heatmap);
    }

    trainAdded(train: Train) {
        this.displayTrain(train);
    }

    trainRemoved(train: Train) {
        const marker = this.trainMarkers.get(train);
        if (marker) {
            this.map.removeLayer(marker);
            this.trainMarkers.delete(train);
        }
    }

    displayStation(station: Station) {
        const marker = L.marker(station.position.toArray(), {
            icon: stationIcon,
            title: station.name,
            alt: station.name,
        }).addTo(this.map);
        marker.bindTooltip(station.name, { direction: "top" });
        marker.on("click", () => {
            uiPanel.display(station);
        });
        this.stationMarkers.set(station, marker);
    }

    displayRail(rail: Rail) {
        const pos = rail.allPositions().map((pos) => pos.toArray());
        const polyline = L.polyline(pos, { color: "blue" }).addTo(this.map);
        this.railLines.set(rail, polyline);
    }

    displayTrain(train: Train) {
        const marker = L.marker(train.position!.getPosition().toArray(), {
            zIndexOffset: 1000,
        }).addTo(this.map);
        marker.setIcon(trainIcon);
        marker.bindTooltip(train.displayName(), { direction: "top" });
        marker.on("click", () => {
            uiPanel.display(train);
        });
        this.trainMarkers.set(train, marker);
    }
}
