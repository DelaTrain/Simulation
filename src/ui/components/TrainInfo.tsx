import type { Train } from "../../core/train";

interface TrainInfoProps {
    train: Train;
    onUpdate: () => void;
}

export default function TrainInfo({ train, onUpdate }: TrainInfoProps) {
    return (
        <div className="flex flex-col gap-2">
            <h3 className="font-bold text-xl">{train.displayName()}</h3>
            <p>Speed: {train.velocity.toFixed(2)} m/s</p>
            <p>Delay: {(train.delay.UIDelayValue / 60).toFixed(2)} min</p>
            <button
                className="btn btn-blue w-fit"
                onClick={() => {
                    train.delay.addDelay(300);
                    onUpdate();
                }}
            >
                Add 5 min delay
            </button>
        </div>
    );
}
