import { FaChartLine, FaForwardStep, FaPause, FaPlay } from "react-icons/fa6";
import useSimulation from "../hooks/useSimulation";
import { VscDebugRestart } from "react-icons/vsc";
import Stats from "./Stats";
import { MdSettings } from "react-icons/md";

interface ControlsProps {
    onToggleStats?: () => void;
    onToggleSettings?: () => void;
}

export default function Controls({ onToggleStats, onToggleSettings }: ControlsProps) {
    const [simulation, simulationState, updateSimulationState] = useSimulation();

    return (
        <div className="fixed flex flex-row bottom-0 items-center justify-between w-screen bg-stone-900 text-white backdrop-blur-md py-1 px-3 rounded-t-lg shadow-md z-10 ">
            <div className="flex gap-3 m-2 w-sm">
                <button
                    disabled={!simulation.canStep()}
                    className="btn btn-icon"
                    onClick={() => {
                        simulation.step();
                        simulation.autoRun = false;
                        updateSimulationState();
                    }}
                >
                    <FaForwardStep />
                </button>
                <button
                    disabled={!simulation.canStep()}
                    className="btn btn-icon"
                    onClick={() => {
                        simulation.autoRun = !simulation.autoRun;
                        simulation.runAutomatically();
                        updateSimulationState();
                    }}
                >
                    {simulation.autoRun ? <FaPause /> : <FaPlay />}
                </button>
                <button
                    className="btn btn-icon"
                    onClick={() => {
                        simulation.reset();
                        simulation.autoRun = false;
                        updateSimulationState();
                    }}
                >
                    <VscDebugRestart />
                </button>
                <button className="btn btn-icon" onClick={onToggleStats}>
                    <FaChartLine />
                </button>
                <button className="btn btn-icon" onClick={onToggleSettings}>
                    <MdSettings />
                </button>
            </div>

            <div className="text-center">
                <p className="text-2xl">
                    <span className="font-bold">{simulationState.currentTime.toString()}</span>
                </p>
                <p className="text-sm opacity-70">{simulationState.deltaTime.toFixed(2)}ms</p>
            </div>

            <div className="flex flex-col gap-1 w-sm py-1">
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
                        onChange={() => {
                            const step = parseInt((document.getElementById("step") as HTMLInputElement).value);
                            simulation.timeStep = step;
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
                        onChange={() => {
                            const speed = parseInt((document.getElementById("speed") as HTMLInputElement).value);
                            simulation.autoRunSpeed = speed;
                            updateSimulationState();
                        }}
                    />
                </label>
            </div>
        </div>
    );
}
