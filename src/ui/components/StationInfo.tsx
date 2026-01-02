import { FaLocationDot } from "react-icons/fa6";
import type { Station } from "../../core/station";
import type { Train } from "../../core/train";
import useSimulation from "../hooks/useSimulation";
import useRenderer from "../hooks/useRenderer";

interface StationInfoProps {
    station: Station;
    onSelectTrain: (train: Train) => void;
}

export default function StationInfo({ station, onSelectTrain }: StationInfoProps) {
    const [simulation, _simulationState, _updateSimulationState] = useSimulation();
    const renderer = useRenderer();

    return (
        <div className="flex flex-col gap-2">
            <div className="flex flex-row items-center gap-2 mb-2">
                <h3 className="font-bold text-xl">{station.name}</h3>
                <button
                    className="btn btn-icon"
                    onClick={() => {
                        renderer.focusOnPosition(station.position.latitude, station.position.longitude);
                    }}
                >
                    <FaLocationDot size={16} />
                </button>
            </div>
            <div className="overflow-y-auto max-h-[80vh] pr-2">
                <table className="table-fixed w-full text-center text-sm border-collapse table-bordered">
                    <thead>
                        <tr className="text-base">
                            <th>Platform (Track)</th>
                            <th>Occupancy</th>
                            <th>Arrival</th>
                            <th>Departure</th>
                        </tr>
                    </thead>
                    <tbody>
                        {station.tracks
                            .sort((a, b) => {
                                if (a.platformNumber === b.platformNumber) {
                                    return a.trackNumber.localeCompare(b.trackNumber);
                                }
                                return a.platformNumber - b.platformNumber;
                            })
                            .map((track) => (
                                <tr key={`${track.platformNumber}-${track.trackNumber}`}>
                                    <th>
                                        {track.platformNumber} ({track.trackNumber})
                                    </th>
                                    <td
                                        className={track.train !== null ? "cursor-pointer text-blue-400" : ""}
                                        onClick={() => {
                                            if (track.train !== null) onSelectTrain(track.train);
                                        }}
                                    >
                                        {track.train === null ? " - " : track.train.displayName()}
                                    </td>
                                    <td>
                                        {station
                                            .nextArrivalForTrack(track, simulation.currentTime)
                                            ?.arrivalTime?.toShortString() ?? " - "}
                                        <div className="text-xs opacity-70">
                                            {station
                                                .nextArrivalForTrack(track, simulation.currentTime)
                                                ?.train.displayName() ?? ""}
                                        </div>
                                    </td>
                                    <td>
                                        {station
                                            .nextDepartureForTrack(track, simulation.currentTime)
                                            ?.departureTime?.toShortString() ?? " - "}
                                        <div className="text-xs opacity-70">
                                            {station
                                                .nextDepartureForTrack(track, simulation.currentTime)
                                                ?.train.displayName() ?? ""}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
