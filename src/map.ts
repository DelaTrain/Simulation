import * as L from "leaflet";
import "leaflet/dist/leaflet.css";
import { Station } from "./core/station";
import { Rail } from "./core/rail";
import { Train } from "./core/train";
import { simulation } from "./core/simulation";

export const stationIcon = L.divIcon({ className: "station-icon" });

export const map = L.map("map").setView([50.061389, 19.938333], 12);
L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
    maxZoom: 19,
    attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
}).addTo(map);

export const displayStation = (station: Station) => {
    const marker = L.marker(station.position.toArray(), {
        icon: stationIcon,
        title: station.name,
        alt: station.name,
    }).addTo(map);
    marker.bindPopup(`<b>${station.name}</b>`);
};

export const displayRail = (rail: Rail) => {
    const latlngs = rail.allPositions().map((pos) => pos.toArray());
    const polyline = L.polyline(latlngs, { color: "blue" }).addTo(map);
    return polyline;
};

let trainMarkers: L.Marker[] = [];

export const displayTrain = (train: Train) => {
    const marker = L.marker(train.position!.getPosition().toArray(), {
        zIndexOffset: 1000,
    }).addTo(map);
    marker.setIcon(L.icon({ iconUrl: "https://cdn-icons-png.flaticon.com/512/565/565410.png", iconSize: [32, 32] }));
    marker.bindPopup(`<b>${train.displayName()}</b>`);
    trainMarkers.push(marker);
    return marker;
};

export const clearTrainMarkers = () => {
    trainMarkers.forEach((marker) => {
        map.removeLayer(marker);
    });
    trainMarkers = [];
};

simulation.rails.forEach((rail) => {
    displayRail(rail);
});

simulation.stations.forEach((station) => {
    displayStation(station);
});

// simulation.callback = (trains: any) => {
//     clearTrainMarkers();
//     trains.forEach((train: any) => {
//         displayTrain(train);
//     });
// };
