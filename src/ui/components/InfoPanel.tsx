import { useCallback, useEffect, useState } from "react";
import useRenderer from "../hooks/useRenderer";
import { Train } from "../../core/train";
import { Station } from "../../core/station";
import StationInfo from "./StationInfo";
import TrainInfo from "./TrainInfo";
import useSimulation from "../hooks/useSimulation";
import { Track } from "../../core/track";
import { FaTimes } from "react-icons/fa";

type ClickedObject = Train | Station;

function calculateClickedObject(event: any): Array<ClickedObject> | null {
    const obj = event.object;
    if (obj instanceof Train) {
        if (obj.position instanceof Track) {
            const track = obj.position as Track;
            const station = track.station;
            return [station, ...station.tracks.map((t) => t.train).filter((t): t is Train => t !== null)];
        }
        return [obj];
    } else if (obj instanceof Station) {
        return [obj];
    }
    return null;
}

export default function InfoPanel() {
    const [selected, setSelected] = useState(null as Array<ClickedObject> | null);
    const [_simulation, simulationState, _updateSimulationState] = useSimulation();

    useRenderer((event) => {
        setSelected(calculateClickedObject(event));
    });

    const updateSelected = useCallback(() => {
        if (selected !== null) {
            setSelected((sel) => {
                if (sel === null) return null;
                const filtered = sel.filter((obj) => !(obj instanceof Train && obj.destroyed)); // Remove destroyed trains
                return filtered.length === 0 ? null : [...filtered];
            });
        }
    }, [selected]);

    // Force update inspected object info when simulation state changes
    useEffect(() => {
        updateSelected();
    }, [simulationState]);

    if (selected === null) return null;

    return (
        <div className="fixed top-4 left-4 w-lg p-4 bg-stone-900 text-white rounded shadow-lg max-h-[85vh] overflow-y-scroll">
            <button className="absolute top-2 right-2 btn btn-icon btn-sm" onClick={() => setSelected(null)}>
                <FaTimes />
            </button>
            {selected[0] instanceof Train ? (
                <TrainInfo train={selected[0]} onUpdate={updateSelected} />
            ) : selected[0] instanceof Station ? (
                <StationInfo station={selected[0]} onSelectTrain={(t: Train) => setSelected([t])} />
            ) : (
                <div>Unknown object</div>
            )}
        </div>
    );
}
