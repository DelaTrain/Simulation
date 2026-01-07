import { useEffect, useState } from "react";
import { Rail } from "../../../core/rail";
import useRenderer from "../../hooks/useRenderer";
import useSimulation from "../../hooks/useSimulation";

export default function GeneralTab() {
    const renderer = useRenderer();
    const [simulation, simulationState, updateSimulationState] = useSimulation();

    const [railMaxSpeedPercentage, setRailMaxSpeedPercentage] = useState(Rail.maxSpeedPercentage * 100);
    useEffect(() => {
        Rail.maxSpeedPercentage = railMaxSpeedPercentage / 100;
    }, [railMaxSpeedPercentage]);

    const [enableHeatmap, setEnableHeatmap] = useState(renderer.isHeatmapEnabled());
    useEffect(() => {
        if (enableHeatmap) renderer.enableHeatmap();
        else renderer.disableHeatmap();
    }, [enableHeatmap, renderer]);

    const [showRedundantRails, setShowRedundantRails] = useState(renderer.isRedundantRailsVisible());
    useEffect(() => {
        if (showRedundantRails) {
            renderer.showRedundantRails();
        } else {
            renderer.hideRedundantRails();
        }
    }, [showRedundantRails, renderer]);

    const [useBetterTrainIcons, setUseBetterTrainIcons] = useState(renderer.getIsUsingBetterTrainIcons());
    useEffect(() => {
        renderer.switchToBetterTrainIcons(useBetterTrainIcons);
    }, [useBetterTrainIcons, renderer]);

    return (
        <div className="flex flex-col gap-4 w-full">
            <label className="flex flex-row items-center justify-between w-full">
                <span>
                    Step size: <span className="font-bold">{simulationState.timeStep}s</span>
                </span>
                <input
                    className="w-50"
                    type="range"
                    id="step"
                    step="1"
                    min="1"
                    value={simulationState.timeStep}
                    max="60"
                    onChange={(e) => {
                        simulation.timeStep = e.currentTarget.valueAsNumber;
                        updateSimulationState();
                    }}
                />
            </label>
            <label className="flex flex-row items-center justify-between w-full">
                <span>
                    Play speed: <span className="font-bold">{simulationState.autoRunSpeed}ms</span>
                </span>
                <input
                    className="w-50"
                    type="range"
                    id="speed"
                    step="10"
                    min="0"
                    value={simulationState.autoRunSpeed}
                    max="1000"
                    onChange={(e) => {
                        simulation.autoRunSpeed = e.currentTarget.valueAsNumber;
                        updateSimulationState();
                    }}
                />
            </label>
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
            <label className="flex flex-row justify-between items-center w-full">
                <span>Show Redundant Rails</span>
                <input
                    type="checkbox"
                    checked={showRedundantRails}
                    onChange={(e) => {
                        setShowRedundantRails(e.currentTarget.checked);
                    }}
                />
            </label>
            <label className="flex flex-row justify-between items-center w-full">
                <span>Use better train icons</span>
                <input
                    type="checkbox"
                    checked={useBetterTrainIcons}
                    onChange={(e) => {
                        setUseBetterTrainIcons(e.currentTarget.checked);
                    }}
                />
            </label>
        </div>
    );
}
