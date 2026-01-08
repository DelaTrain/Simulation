import { useEffect, useState } from "react";
import { statsCollector, type StatsKey } from "../../utils/stats";
import { simulation } from "../../core/simulation";

export default function useCategoryStatsCollectorTotal(key: StatsKey, categoryName: string) {
    const [stats, setStats] = useState({
        labels: statsCollector.categoryStats.get(categoryName)?.timeSteps ?? [],
        data: statsCollector.categoryStats.get(categoryName)?.[key] ?? [],
    });

    useEffect(() => {
        const update = () => {
            setStats({
                labels: statsCollector.categoryStats.get(categoryName)?.timeSteps ?? [],
                data: statsCollector.categoryStats.get(categoryName)?.[key] ?? [],
            });
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
