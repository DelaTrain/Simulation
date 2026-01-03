import { FaLocationDot } from "react-icons/fa6";
import type { Station } from "../../core/station";
import type { Train } from "../../core/train";
import useSimulation from "../hooks/useSimulation";
import useRenderer from "../hooks/useRenderer";
import type { TrainScheduleStep } from "../../core/trainScheduleStep";
import { simulation } from "../../core/simulation";

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
            <div className="overflow-y-auto h-panel pr-2">
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
                                        className={
                                            track.train !== null ? "cursor-pointer text-blue-400 hover:underline" : ""
                                        }
                                        onClick={() => {
                                            if (track.train !== null) onSelectTrain(track.train);
                                        }}
                                    >
                                        {track.train === null ? " - " : track.train.displayName()}
                                    </td>

                                    <TimeTrainInfo
                                        schedule={station.nextArrivalForTrack(track, simulation.currentTime)}
                                        isArrivalTime={true}
                                        onSelectTrain={onSelectTrain}
                                    />
                                    <TimeTrainInfo
                                        schedule={station.nextDepartureForTrack(track, simulation.currentTime)}
                                        isArrivalTime={false}
                                        onSelectTrain={onSelectTrain}
                                    />
                                </tr>
                            ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

function TimeTrainInfo({
    schedule,
    isArrivalTime,
    onSelectTrain,
}: {
    schedule: TrainScheduleStep | null;
    isArrivalTime: boolean;
    onSelectTrain: (train: Train) => void;
}) {
    if (!schedule) {
        return <td> - </td>;
    }

    const trainTemplate = schedule.train;
    const train = simulation.findTrainByTemplate(trainTemplate);
    const renderer = useRenderer();
    return (
        <td>
            {(isArrivalTime ? schedule.arrivalTime?.toShortString() : schedule.departureTime?.toShortString()) ?? " - "}
            <div
                className={`text-xs opacity-70 ${train !== null ? "text-blue-500 cursor-pointer hover:underline" : ""}`}
                onClick={() => {
                    if (train !== null) {
                        onSelectTrain(train);
                        renderer.focusOnPosition(
                            train.position.getPosition().latitude,
                            train.position.getPosition().longitude
                        );
                    }
                }}
            >
                {trainTemplate.displayName()}
            </div>
        </td>
    );
}
