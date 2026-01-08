import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    Filler,
} from "chart.js";
import { Line } from "react-chartjs-2";
import useStatsCollector from "../hooks/useStatsCollector";
import type { StatsKey } from "../../utils/stats";
import { makeData } from "../../utils/chartUtils";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler);

interface ChartProps {
    statistic: StatsKey;
    title: string;
}

export default function Chart({ statistic, title }: ChartProps) {
    const stats = useStatsCollector(statistic);
    return <Line data={makeData(stats, title)} options={{ animation: false, responsive: true }} />;
}
