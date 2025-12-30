import { useEffect, useState } from "react";
import { statsCollector, type StatsKey } from "../stats";
import type { Time } from "../../utils/time";
import { simulation } from "../../core/simulation";

export default function useStatsCollector(key: StatsKey) {
    const [stats, setStats] = useState({ labels: statsCollector.timeSteps, data: statsCollector[key] });

    useEffect(() => {
        const update = () => {
            setStats({ labels: statsCollector.timeSteps, data: statsCollector[key] });
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
