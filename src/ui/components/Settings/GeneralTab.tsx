import { use, useEffect, useState } from "react";
import { Rail } from "../../../core/rail";
import useRenderer from "../../hooks/useRenderer";

export default function GeneralTab() {
    const [railMaxSpeedPercentage, setRailMaxSpeedPercentage] = useState(Rail.maxSpeedPercentage * 100);
    const renderer = useRenderer();
    const [enableHeatmap, setEnableHeatmap] = useState(renderer.isHeatmapEnabled());
    useEffect(() => {
        Rail.maxSpeedPercentage = railMaxSpeedPercentage / 100;
    }, [railMaxSpeedPercentage]);
    useEffect(() => {
        if (enableHeatmap) renderer.enableHeatmap();
        else renderer.disableHeatmap();
    }, [enableHeatmap, renderer]);
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
            <label className="flex flex-row justify-between items-center w-full">
                <span>Enable Heatmap</span>
                <input
                    type="checkbox"
                    checked={enableHeatmap}
                    onChange={(e) => {
                        setEnableHeatmap(e.currentTarget.checked);
                    }}
                />
            </label>
        </div>
    );
}
