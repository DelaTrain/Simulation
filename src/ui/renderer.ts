import type { Simulation } from "../core/simulation";
import * as L from "leaflet";
import "leaflet.heat/dist/leaflet-heat.js";
import type { Station } from "../core/station";
import type { Rail } from "../core/rail";
import type { Train } from "../core/train";
import { mapValue } from "../utils/math";
import SimulationEvent from "../utils/event";

const MIN_RENDER_DELAY_SECONDS = 30;
const MAX_DELAY_SECONDS = 3600;
const MAX_HEATMAP_INTENSITY = 1.0;

const colorScale = (value: number): string => {
    const clampedValue = Math.max(0, Math.min(1, value));
    const hue = Math.floor(120 * (1 - clampedValue));
    return `hsl(${hue}, 100%, 50%)`;
};

const stationIcon = (importance: number): L.DivIcon => {
    if (importance >= 120) return L.divIcon({ className: "station-icon-large" });
    if (importance >= 52) return L.divIcon({ className: "station-icon" });
    return L.divIcon({ className: "station-icon-small" });
};

export interface RendererClickEvent {
    latitude: number;
    longitude: number;
    object: Station | Train;
}

export class Renderer {
    map: L.Map;
    trainMarkers: Map<Train, L.Marker>;
    stationMarkers: Map<Station, L.Marker>;
    railLines: Map<Rail, L.Polyline>;
    redundantRailsLines: Map<Rail, L.Polyline>;
    heatmap: any;
    clickEvent: SimulationEvent<RendererClickEvent> = new SimulationEvent();
    enableRedundantRails: boolean = true;
    useBetterTrainIcons: boolean = false;

    constructor(protected simulation: Simulation) {
        this.simulation.stepEvent.subscribe(this.update.bind(this));
        this.simulation.trainAddedEvent.subscribe(this.trainAdded.bind(this));
        this.simulation.trainRemovedEvent.subscribe(this.trainRemoved.bind(this));
        this.simulation.resetEvent.subscribe(this.reset.bind(this));

        this.map = L.map("map", { zoomControl: false }).setView([50.061389, 19.938333], 12);
        this.trainMarkers = new Map();
        this.stationMarkers = new Map();
        this.railLines = new Map();
        this.redundantRailsLines = new Map();
        this.setup();
        this.heatmap = null;
    }

    setup() {
        L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
            maxZoom: 19,
            attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        }).addTo(this.map);
        this.initialDraw();
    }

    focusOnPosition(latitude: number, longitude: number, zoom: number = 14) {
        this.map.setView([latitude, longitude], zoom);
    }

    showRedundantRails() {
        if (this.enableRedundantRails) return;
        this.enableRedundantRails = true;
        this.simulation.redundantRails.forEach((rail) => {
            this.displayRedundantRail(rail);
        });
    }

    hideRedundantRails() {
        if (!this.enableRedundantRails) return;
        this.redundantRailsLines.forEach((polyline) => {
            this.map.removeLayer(polyline);
        });
        this.redundantRailsLines.clear();
        this.enableRedundantRails = false;
    }

    isRedundantRailsVisible(): boolean {
        return this.enableRedundantRails;
    }

    initialDraw() {
        if (this.enableRedundantRails) {
            this.simulation.redundantRails.forEach((rail) => {
                this.displayRedundantRail(rail);
            });
        }

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

        this.redundantRailsLines.forEach((polyline) => {
            this.map.removeLayer(polyline);
        });
        this.redundantRailsLines.clear();

        this.initialDraw();
    }

    enableHeatmap() {
        if (this.heatmap === null) {
            this.heatmap = (L as any).heatLayer([], { radius: 50, blur: 50, maxZoom: 1 }).addTo(this.map);
            this.update();
        }
    }

    disableHeatmap() {
        if (this.heatmap !== null) {
            this.map.removeLayer(this.heatmap);
            this.heatmap = null;
        }
    }

    isHeatmapEnabled(): boolean {
        return this.heatmap !== null;
    }

    update() {
        this.simulation.trains.forEach((train) => {
            const marker = this.trainMarkers.get(train);
            if (marker) {
                if (
                    marker.getLatLng().lat !== train.getPosition().latitude ||
                    marker.getLatLng().lng !== train.getPosition().longitude
                )
                    marker.setLatLng(train.getPosition().toArray());
                marker.getElement()!.style.backgroundColor = colorScale(
                    mapValue(0, MAX_DELAY_SECONDS, train.delay.UIDelayValue)
                );
            }
        });

        if (this.isHeatmapEnabled()) {
            const heatmap = this.simulation.trains
                .map((train) => {
                    const marker = this.trainMarkers.get(train);
                    if (marker) {
                        marker.setLatLng(train.getPosition().toArray());
                        marker.getElement()!.style.backgroundColor = colorScale(
                            mapValue(0, MAX_DELAY_SECONDS, train.delay.UIDelayValue)
                        );
                        if (train.delay.UIDelayValue > MIN_RENDER_DELAY_SECONDS) {
                            return [
                                train.getPosition().latitude,
                                train.getPosition().longitude,
                                train.delay.UIDelayValue * MAX_HEATMAP_INTENSITY,
                            ];
                        }
                    }
                    return null;
                })
                .filter((item) => item !== null);
            this.heatmap.setLatLngs(heatmap);
        }
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
            icon: stationIcon(station.importance),
            title: station.name,
            alt: station.name,
            zIndexOffset: station.importance,
        }).addTo(this.map);
        marker.bindTooltip(station.name, { direction: "top" });
        marker.on("click", () => {
            const { lat, lng } = marker.getLatLng();
            this.clickEvent.emit({
                latitude: lat,
                longitude: lng,
                object: station,
            });
        });
        this.stationMarkers.set(station, marker);
    }

    displayRail(rail: Rail) {
        const pos = rail.allPositions().map((pos) => pos.toArray());
        const polyline = L.polyline(pos, { color: "var(--color-blue-400)" }).addTo(this.map);
        this.railLines.set(rail, polyline);
    }

    displayRedundantRail(rail: Rail) {
        const pos = rail.allPositions().map((pos) => pos.toArray());
        const polyline = L.polyline(pos, { color: "var(--color-gray-400)" }).addTo(this.map);
        polyline.bringToBack();
        this.redundantRailsLines.set(rail, polyline);
    }

    displayTrain(train: Train) {
        const trainIcon = L.divIcon({ className: this.useBetterTrainIcons ? "better-train-icon" : "train-icon" });
        const marker = L.marker(train.getPosition().toArray(), {
            zIndexOffset: 1000,
        }).addTo(this.map);
        marker.setIcon(trainIcon);
        marker.bindTooltip(train.displayName(), { direction: "top" });
        marker.on("click", () => {
            const { lat, lng } = marker.getLatLng();
            this.clickEvent.emit({
                latitude: lat,
                longitude: lng,
                object: train,
            });
        });
        this.trainMarkers.set(train, marker);
    }

    switchToBetterTrainIcons() {
        this.useBetterTrainIcons = !this.useBetterTrainIcons;
        this.trainMarkers.forEach((marker) => {
            this.map.removeLayer(marker);
        });
        this.trainMarkers.clear();
        this.simulation.trains.forEach((train) => {
            this.displayTrain(train);
        });
    }
}
