import { useCallback, useEffect, useMemo, useState } from "react";
import useRenderer from "../hooks/useRenderer";
import { Train } from "../../core/train";
import { Station } from "../../core/station";
import StationInfo from "./StationInfo";
import TrainInfo from "./TrainInfo";
import useSimulation from "../hooks/useSimulation";
import { Track } from "../../core/track";
import { FaTimes } from "react-icons/fa";
import type { RendererClickEvent } from "../renderer";
import { useDummyHistoryNavigation } from "../hooks/useHistoryNavigation";

type ClickedObject = Train | Station;

function calculateClickedObject(event: RendererClickEvent): ClickedObject | null {
    const obj = event.object;
    if (obj instanceof Train && obj.position instanceof Track) {
        const track = obj.position as Track;
        const station = track.station;
        // [station, ...station.tracks.map((t) => t.train).filter((t): t is Train => t !== null)]
        return station;
    }
    return obj;
}

export default function InfoPanel() {
    const [selectedHistory, updateSelectedHistory, addSelected] = useDummyHistoryNavigation<ClickedObject | null>([
        null,
    ]);
    const [_simulation, simulationState, _updateSimulationState] = useSimulation();

    const selected = useMemo(() => {
        return selectedHistory[selectedHistory.length - 1];
    }, [selectedHistory]);

    const setSelected = useCallback((obj: ClickedObject | null) => addSelected(obj), [addSelected]);

    useRenderer((event) => setSelected(calculateClickedObject(event)));

    const updateSelected = useCallback(() => {
        if (selected !== null) updateSelectedHistory((history) => [...history]);
    }, [selected]);

    // Force update inspected object info when simulation state changes
    useEffect(() => {
        updateSelected();
    }, [simulationState]);

    if (selected === null) return null;

    return (
        <div className="fixed top-4 left-4 w-lg p-4 bg-stone-900 text-white rounded shadow-lg z-10">
            <button className="absolute top-2 right-2 btn btn-icon btn-sm" onClick={() => setSelected(null)}>
                <FaTimes />
            </button>
            {selected instanceof Train ? (
                <TrainInfo
                    train={selected}
                    onUpdate={updateSelected}
                    onSelectStation={(s: Station) => setSelected(s)}
                />
            ) : selected instanceof Station ? (
                <StationInfo station={selected} onSelectTrain={(t: Train) => setSelected(t)} />
            ) : (
                <div>Unknown object</div>
            )}
        </div>
    );
}
