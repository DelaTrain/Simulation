import { useEffect, useState } from "react";
import type { Train } from "../../core/train";
import useRenderer from "../hooks/useRenderer";
import { Track } from "../../core/track";
import type { Station } from "../../core/station";
import Collapsable from "./Collapsable";
import { FaLocationDot, FaSchool } from "react-icons/fa6";
import type { TrainTemplate } from "../../core/trainTemplate";
import Tooltip from "./Tooltip";

interface TrainInfoProps {
    train: Train;
    onUpdate: () => void;
    onSelectStation: (train: Station) => void;
    onSelectTrainTemplate: (train: TrainTemplate) => void;
}

export default function TrainInfo({ train, onUpdate, onSelectStation, onSelectTrainTemplate }: TrainInfoProps) {
    const [delay, setDelay] = useState(5);
    const renderer = useRenderer();

    useEffect(() => {
        if (train.destroyed) onSelectTrainTemplate(train.trainTemplate);
    }, [train, onSelectTrainTemplate]);

    if (train.destroyed) {
        return (
            <div className="flex flex-col text-md">
                <div className="flex flex-row items-center gap-2 mb-2">
                    <h3 className="font-bold text-xl">{train.displayName()}</h3>
                </div>
                <div className="text-red-500 font-bold">This train has been destroyed.</div>
            </div>
        );
    }

    return (
        <div className="flex flex-col text-md">
            <div className="flex flex-row items-center gap-2 mb-2">
                <h3 className="font-bold text-xl">{train.displayName()}</h3>
                <Tooltip content="Focus on train">
                    <button
                        className="btn btn-icon"
                        onClick={() => {
                            renderer.focusOnPosition(
                                train.position.getPosition().latitude,
                                train.position.getPosition().longitude
                            );
                        }}
                    >
                        <FaLocationDot size={16} />
                    </button>
                </Tooltip>
                {train.position instanceof Track && (
                    <Tooltip content="Show station">
                        <button
                            className="btn btn-icon"
                            onClick={() => {
                                onSelectStation((train.position as Track).station);
                            }}
                        >
                            <FaSchool size={20} />
                        </button>
                    </Tooltip>
                )}
            </div>

            <div className="overflow-y-auto h-panel pr-3 pb-2">
                <Collapsable title="Description" className="opacity-60 -translate-x-1 mb-1/2">
                    <p className="opacity-60 text-sm pl-2">
                        {train.trainTemplate.description.map((e, i) => (
                            <span key={i}>
                                {e}
                                <br />
                            </span>
                        ))}
                    </p>
                </Collapsable>
                <div className="h-8 m-1/2 align-middle" style={{ lineHeight: "2rem" }}>
                    Category: <span className="font-bold">{train.trainTemplate.type.fullName}</span>
                </div>
                <div className="h-8 m-1/2 align-middle" style={{ lineHeight: "2rem" }}>
                    Speed: <span className="font-bold">{train.velocity.toFixed(2)} m/s</span>
                </div>
                <div className="flex flex-row items-center gap-2 justify-between h-8 m-1/2">
                    <p>
                        Delay: <span className="font-bold">{(train.delay.UIDelayValue / 60).toFixed(2)} min</span>
                    </p>
                    <span>
                        <input
                            className="border-white text-white border w-15 p-1 mr-3 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 bg-stone-700"
                            type="number"
                            value={delay}
                            onChange={(v) => setDelay(parseFloat(v.target.value))}
                        />
                        <button
                            className="btn w-fit py-1 px-4 bg-blue-500 text-white hover:bg-blue-700"
                            onClick={() => {
                                train.delay.addDelay(60 * delay);
                                onUpdate();
                            }}
                        >
                            Add delay
                        </button>
                    </span>
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
