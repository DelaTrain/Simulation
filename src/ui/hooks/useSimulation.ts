import { useCallback, useEffect, useState } from "react";
import { simulation } from "../../core/simulation";

export default function useSimulation() {
    const [simulationState, setSimulationState] = useState(simulation.getState());

    useEffect(() => {
        const update = () => {
            setSimulationState(simulation.getState());
        };
        simulation.stepEvent.subscribe(update);
        simulation.resetEvent.subscribe(update);
        simulation.valueChangedEvent.subscribe(update);
        return () => {
            simulation.stepEvent.unsubscribe(update);
            simulation.resetEvent.unsubscribe(update);
            simulation.valueChangedEvent.unsubscribe(update);
        };
    }, []);

    const updateState = useCallback(() => {
        setSimulationState(simulation.getState());
        simulation.valueChangedEvent.emit();
    }, []);

    return [simulation, simulationState, updateState] as const;
}
