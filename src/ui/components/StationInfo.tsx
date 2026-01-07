import { FaLocationDot } from "react-icons/fa6";
import type { Station } from "../../core/station";
import type { Train } from "../../core/train";
import useRenderer from "../hooks/useRenderer";
import type { TrainScheduleStep } from "../../core/trainScheduleStep";
import { simulation } from "../../core/simulation";
import type { TrainTemplate } from "../../core/trainTemplate";

interface StationInfoProps {
    station: Station;
    onSelectTrain: (train: Train | TrainTemplate) => void;
}

export default function StationInfo({ station, onSelectTrain }: StationInfoProps) {
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
                <p className="text-sm pb-2">Importance: {station.importance}</p>
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
                            .filter((track) => !track.isHidden)
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
                                        schedule={station.nextArrivalForTrack(track)}
                                        isArrivalTime={true}
                                        onSelectTrain={onSelectTrain}
                                    />
                                    <TimeTrainInfo
                                        schedule={station.nextDepartureForTrack(track)}
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
    onSelectTrain: (train: Train | TrainTemplate) => void;
}) {
    if (!schedule) {
        return <td> - </td>;
    }

    const trainTemplate = schedule.train;
    const train = simulation.findTrainByTemplate(trainTemplate);
    const renderer = useRenderer();
    return (
        <td>
            <span className="flex items-center justify-center">
                {(isArrivalTime ? schedule.arrivalTime?.toShortString() : schedule.departureTime?.toShortString()) ??
                    " - "}
                {train !== null && train.delay.UIDelayValue >= 60 && (
                    <span className="text-red-500 ml-1 text-xs">+{(train?.delay.UIDelayValue / 60).toFixed(0)}min</span>
                )}
            </span>
            <div
                className="text-xs opacity-70 text-blue-500 cursor-pointer hover:underline"
                onClick={() => {
                    if (train !== null) {
                        onSelectTrain(train);
                        renderer.focusOnPosition(
                            train.position.getPosition().latitude,
                            train.position.getPosition().longitude
                        );
                    } else {
                        onSelectTrain(trainTemplate);
                    }
                }}
            >
                {trainTemplate.displayName()}
            </div>
        </td>
    );
}
