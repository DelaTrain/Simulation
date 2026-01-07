import { useEffect, useState } from "react";
import { statsCollector, type StationStatsKey } from "../../utils/stats";
import { simulation } from "../../core/simulation";
import type { Station } from "../../core/station";

function getCollector(station: Station) {
    return statsCollector.stationsStats.get(station.name);
}

export default function useStationStatsCollector(key: StationStatsKey | StationStatsKey[], station: Station) {
    const [stats, setStats] = useState({
        labels: getCollector(station)?.timeSteps ?? [],
        data: Array.isArray(key)
            ? key.map((k) => getCollector(station)?.[k] ?? [])
            : getCollector(station)?.[key] ?? [],
    });

    useEffect(() => {
        const update = () => {
            const collector = getCollector(station);
            if (!collector) {
                console.warn(`No stats collector found for station ${station.name}`);
                return;
            }

            setStats({
                labels: collector.timeSteps,
                data: Array.isArray(key) ? key.map((k) => collector[k]) : collector[key],
            });
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
