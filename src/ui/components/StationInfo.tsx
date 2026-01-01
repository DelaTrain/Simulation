import type { Station } from "../../core/station";
import type { Train } from "../../core/train";
import useSimulation from "../hooks/useSimulation";

interface StationInfoProps {
    station: Station;
    onSelectTrain: (train: Train) => void;
}

export default function StationInfo({ station, onSelectTrain }: StationInfoProps) {
    const [simulation, _simulationState, _updateSimulationState] = useSimulation();

    return (
        <div className="flex flex-col gap-2">
            <h3 className="font-bold text-xl">{station.name}</h3>
            <div className="overflow-y-auto max-h-[80vh] pr-2">
                <table>
                    <thead>
                        <tr>
                            <th>
                                Platform
                                <br />
                                (Track)
                            </th>
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
                            .filter(
                                // skip printing imaginary tracks except those with scheduled arrival/ departure times (e.g. abroad)
                                (track) =>
                                    station.nextArrivalForTrack(track, simulation.currentTime) !== null ||
                                    station.nextDepartureForTrack(track, simulation.currentTime) !== null
                            )
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
                                        {station.nextArrivalForTrack(track, simulation.currentTime)?.displayArrival() ??
                                            " - "}
                                    </td>
                                    <td>
                                        {station
                                            .nextDepartureForTrack(track, simulation.currentTime)
                                            ?.displayDeparture() ?? " - "}
                                    </td>
                                </tr>
                            ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
