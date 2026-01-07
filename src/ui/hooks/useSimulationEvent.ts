import { useEffect } from "react";
import { simulation, type SimulationEvents } from "../../core/simulation";

export default function useSimulationEvent(eventKey: SimulationEvents, callback: () => void) {
    useEffect(() => {
        simulation[eventKey].subscribe(callback);
        return () => {
            simulation[eventKey].unsubscribe(callback);
        };
    }, [callback, eventKey]);
}
