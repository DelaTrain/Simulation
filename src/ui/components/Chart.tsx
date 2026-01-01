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
import useStatsCollector from "../hooks/useStatsCollector";
import type { StatsKey } from "../../utils/stats";
import type { Time } from "../../utils/time";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

interface ChartProps {
    statistic: StatsKey;
    title: string;
}

function makeData(stats: { labels: Time[]; data: number[] }, title: string) {
    return {
        labels: stats.labels.map((t) => t.toString()),
        datasets: [
            {
                label: title,
                data: stats.data,
                borderColor: "rgba(75, 192, 192, 1)",
                backgroundColor: "rgba(75, 192, 192, 0.2)",
                fill: true,
                pointRadius: 0,
            },
        ],
    };
}

export default function Chart({ statistic, title }: ChartProps) {
    const stats = useStatsCollector(statistic);
    return <Line data={makeData(stats, title)} options={{ animation: false, responsive: true }} />;
}
