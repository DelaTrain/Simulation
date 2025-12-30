import { use, useRef, useState } from "react";
import type { Train } from "../../core/train";

interface TrainInfoProps {
    train: Train;
    onUpdate: () => void;
}

export default function TrainInfo({ train, onUpdate }: TrainInfoProps) {
    const [delay, setDelay] = useState(5);

    return (
        <div className="flex flex-col gap-2">
            <h3 className="font-bold text-xl">{train.displayName()}</h3>
            <p>Speed: {train.velocity.toFixed(2)} m/s</p>
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
    );
}
