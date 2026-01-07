import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
} from "chart.js";
import { Line } from "react-chartjs-2";
import type { StationStatsKey } from "../../utils/stats";
import useStationStatsCollector from "../hooks/useStationStatsCollector";
import type { Station } from "../../core/station";
import { makeMultipleData } from "../../utils/chartUtils";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

interface ChartProps {
    station: Station;
    statistic: Array<{ key: StationStatsKey; title: string }>;
}

export default function Chart({ statistic, station }: ChartProps) {
    const stats = useStationStatsCollector(
        statistic.map((v) => v.key),
        station
    );
    return (
        <Line
            data={makeMultipleData({
                labels: stats.labels,
                data: stats.data as number[][],
                title: statistic.map((s) => s.title),
            })}
            options={{ animation: false, responsive: true }}
        />
    );
}
