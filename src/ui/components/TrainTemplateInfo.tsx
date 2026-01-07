import useRenderer from "../hooks/useRenderer";
import type { Station } from "../../core/station";
import Collapsable from "./Collapsable";
import type { TrainTemplate } from "../../core/trainTemplate";
import useSimulationEvent from "../hooks/useSimulationEvent";
import { simulation } from "../../core/simulation";
import type { Train } from "../../core/train";

interface TrainInfoProps {
    train: TrainTemplate;
    onSelectStation: (train: Station) => void;
    onSelectTrain: (train: Train) => void;
}

export default function TrainInfo({ train, onSelectStation, onSelectTrain }: TrainInfoProps) {
    const renderer = useRenderer();
    useSimulationEvent("trainAddedEvent", () => {
        if (simulation.trains.some((t) => t.trainTemplate === train)) {
            // Train has been added, select the train instead
            const simTrain = simulation.trains.find((t) => t.trainTemplate === train);
            if (simTrain) onSelectTrain(simTrain);
        }
    });

    return (
        <div className="flex flex-col text-md">
            <div className="flex flex-row items-center gap-2 mb-2">
                <h3 className="font-bold text-xl opacity-70">{train.displayName()}</h3>
            </div>

            <div className="overflow-y-auto h-panel pr-3 pb-2">
                <Collapsable title="Description" className="opacity-60 -translate-x-1 mb-1/2">
                    <p className="opacity-60 text-sm pl-2">
                        {train.description.map((e, i) => (
                            <span key={i}>
                                {e}
                                <br />
                            </span>
                        ))}
                    </p>
                </Collapsable>
                <div className="h-8 m-1/2 align-middle" style={{ lineHeight: "2rem" }}>
                    Category: <span className="font-bold">{train.type.fullName}</span>
                </div>

                <table className="table-fixed w-full text-center text-sm border-collapse table-bordered mt-4">
                    <thead>
                        <tr className="text-base">
                            <th>Station</th>
                            <th>Platform (Track)</th>
                            <th>Arrival</th>
                            <th>Departure</th>
                        </tr>
                    </thead>
                    <tbody>
                        {train.getSchedules().map((schedule, i) => (
                            <tr key={i} className={schedule.satisfied ? "opacity-50" : ""}>
                                <th
                                    className="text-blue-500 hover:underline cursor-pointer"
                                    onClick={() => {
                                        onSelectStation(schedule.track.station);
                                        renderer.focusOnPosition(
                                            schedule.track.station.position.latitude,
                                            schedule.track.station.position.longitude
                                        );
                                    }}
                                >
                                    {schedule.track.station.name}
                                </th>
                                <th>
                                    {schedule.track.platformNumber} ({schedule.track.trackNumber})
                                </th>
                                <td>
                                    {schedule.arrivalTime?.toShortString() ?? " - "}{" "}
                                    {schedule.realArrivalTime !== null &&
                                        ` (${schedule.realArrivalTime.toShortString()})`}
                                </td>
                                <td>
                                    {schedule.departureTime?.toShortString() ?? " - "}
                                    {schedule.realDepartureTime !== null &&
                                        ` (${schedule.realDepartureTime.toShortString()})`}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
