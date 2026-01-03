import { useEffect, useState } from "react";
import { Rail } from "../../../core/rail";

export default function GeneralTab() {
    const [railMaxSpeedPercentage, setRailMaxSpeedPercentage] = useState(Rail.maxSpeedPercentage * 100);
    useEffect(() => {
        Rail.maxSpeedPercentage = railMaxSpeedPercentage / 100;
    }, [railMaxSpeedPercentage]);
    return (
        <div className="flex flex-col gap-4 w-full">
            <label className="flex flex-row justify-between items-center w-full">
                <span>
                    Rail Max Speed Percentage: <span className="font-bold">{railMaxSpeedPercentage.toFixed(0)}%</span>
                </span>
                <input
                    className="w-50"
                    type="range"
                    min="1"
                    value={railMaxSpeedPercentage}
                    max="100"
                    onChange={(e) => {
                        setRailMaxSpeedPercentage(e.currentTarget.valueAsNumber);
                    }}
                />
            </label>
        </div>
    );
}
