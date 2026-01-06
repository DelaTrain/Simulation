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
        <div className="fixed bottom-0 left-0 h-fit w-screen flex flex-row justify-center items-end pointer-events-none">
            <div className="flex flex-row items-center justify-between bg-stone-900 flex-1 text-white py-1 px-3 rounded-lg shadow-md pointer-events-auto m-2  z-10">
                <div className="flex gap-3 m-2 lg:w-sm ">
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

                <div className="text-center px-3">
                    <p className="text-xs mt-1">{simulation.day.toLocaleDateString()}</p>
                    <p className="text-2xl">
                        <span className="font-bold">{simulationState.currentTime.toString()}</span>
                    </p>
                    <p className="text-xs opacity-70">{simulationState.deltaTime.toFixed(2)}ms</p>
                </div>

                <div className="md:flex flex-col gap-1 w-sm py-1 hidden">
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
        </div>
    );
}
