import { useEffect, useState } from "react";
import { statsCollector } from "../../utils/stats";
import { simulation } from "../../core/simulation";

export default function useStatsCollectorTotal() {
    const [stats, setStats] = useState(statsCollector.totalStats());

    useEffect(() => {
        const update = () => {
            setStats(statsCollector.totalStats());
        };
        simulation.stepEvent.subscribe(update);
        simulation.resetEvent.subscribe(update);
        return () => {
            simulation.stepEvent.unsubscribe(update);
            simulation.resetEvent.unsubscribe(update);
        };
    }, []);

    return stats;
}
