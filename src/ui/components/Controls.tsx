import useSimulation from "../hooks/useSimulation";

export default function Controls() {
    const [simulation, simulationState, updateSimulationState] = useSimulation();

    return (
        <div className="fixed flex flex-col items-center top-4 right-4 bg-stone-900 text-white backdrop-blur-md p-5 rounded-md shadow-md z-10 w-lg">
            <p className="text-lg">
                Czas symulacji: <span className="font-bold">{simulationState.currentTime.toString()}</span>
            </p>
            <p className="text-sm opacity-70">{simulationState.deltaTime.toFixed(2)}ms</p>
            <div className="flex gap-4 my-4">
                <button
                    className="btn btn-blue"
                    onClick={() => {
                        simulation.step();
                        simulation.autoRun = false;
                        updateSimulationState();
                    }}
                >
                    Step
                </button>
                <button
                    className="btn btn-blue"
                    onClick={() => {
                        simulation.autoRun = !simulation.autoRun;
                        simulation.runAutomatically();
                        updateSimulationState();
                    }}
                >
                    {simulation.autoRun ? "Pause" : "Play"}
                </button>
                <button
                    className="btn btn-blue"
                    onClick={() => {
                        simulation.reset();
                        simulation.autoRun = false;
                        updateSimulationState();
                    }}
                >
                    Restart
                </button>
                <button className="btn btn-blue">Stats</button>
            </div>
            <div className="flex flex-col gap-2 w-full">
                <label className="flex flex-row items-center justify-between w-full">
                    Step size: {simulationState.timeStep}s
                    <input
                        className="w-75"
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
                    Play speed: {simulationState.autoRunSpeed}ms
                    <input
                        className="w-75"
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
