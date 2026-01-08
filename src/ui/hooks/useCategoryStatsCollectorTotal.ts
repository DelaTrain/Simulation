import { useEffect, useState } from "react";
import { statsCollector } from "../../utils/stats";
import { simulation } from "../../core/simulation";

export default function useStatsCollectorTotal(categoryName: string) {
    const [stats, setStats] = useState(statsCollector.categoryStats.get(categoryName)?.totalStats());

    useEffect(() => {
        const update = () => {
            setStats(statsCollector.categoryStats.get(categoryName)?.totalStats());
        };
        simulation.stepEvent.subscribe(update);
        simulation.resetEvent.subscribe(update);
        return () => {
            simulation.stepEvent.unsubscribe(update);
            simulation.resetEvent.unsubscribe(update);
        };
    }, [categoryName]);

    return stats;
}
