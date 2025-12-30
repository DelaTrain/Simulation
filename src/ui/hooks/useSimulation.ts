import { use, useCallback, useEffect, useState } from "react";
import { simulation } from "../../core/simulation";

export default function useSimulation() {
    const [simulationState, setSimulationState] = useState(simulation.getState());

    useEffect(() => {
        const update = () => {
            setSimulationState(simulation.getState());
        };
        simulation.stepEvent.subscribe(update);
        simulation.resetEvent.subscribe(update);
        return () => {
            simulation.stepEvent.unsubscribe(update);
            simulation.resetEvent.unsubscribe(update);
        };
    }, []);

    const updateState = useCallback(() => {
        setSimulationState(simulation.getState());
    }, []);

    return [simulation, simulationState, updateState] as const;
}
