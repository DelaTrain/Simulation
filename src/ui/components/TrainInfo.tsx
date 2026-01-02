import { useState } from "react";
import type { Train } from "../../core/train";
import useRenderer from "../hooks/useRenderer";
import { Track } from "../../core/track";
import type { Station } from "../../core/station";

interface TrainInfoProps {
    train: Train;
    onUpdate: () => void;
    onSelectStation: (train: Station) => void;
}

export default function TrainInfo({ train, onUpdate, onSelectStation }: TrainInfoProps) {
    const [delay, setDelay] = useState(5);
    const renderer = useRenderer();

    return (
        <div className="flex flex-col gap-2 text-md">
            <h3 className="font-bold text-xl">{train.displayName()}</h3>
            <div className="overflow-y-auto max-h-[80vh] pr-3">
                <div className="h-8 m-1/2 align-middle" style={{ lineHeight: "2rem" }}>
                    Category: {train.trainTemplate.type.fullName}
                </div>
                <div className="h-8 m-1/2 align-middle" style={{ lineHeight: "2rem" }}>
                    Speed: {train.velocity.toFixed(2)} m/s
                </div>
                <div className="flex flex-row items-center gap-2 justify-between h-8 m-1/2">
                    <p>Delay: {(train.delay.UIDelayValue / 60).toFixed(2)} min</p>
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
                <p className="opacity-60 text-sm py-2 px-1">
                    {train.trainTemplate.description.map((e, i) => (
                        <span key={i}>
                            {e}
                            <br />
                        </span>
                    ))}
                </p>
                <div className="flex flex-row gap-2 mt-2">
                    <button
                        className="btn btn-blue w-fit"
                        onClick={() => {
                            renderer.focusOnPosition(
                                train.position.getPosition().latitude,
                                train.position.getPosition().longitude
                            );
                        }}
                    >
                        Show on map
                    </button>
                    {train.position instanceof Track && (
                        <button
                            className="btn btn-blue w-fit"
                            onClick={() => {
                                onSelectStation((train.position as Track).station);
                            }}
                        >
                            Show station
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}
