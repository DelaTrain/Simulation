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
import useCategoryStatsCollector from "../hooks/useCategoryStatsCollector";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler);

interface CategoryChartProps {
    statistic: StatsKey;
    title: string;
    categoryName: string;
}

export default function CategoryChart({ statistic, title, categoryName }: CategoryChartProps) {
    const stats = useCategoryStatsCollector(statistic, categoryName);
    return <Line data={makeData(stats, title)} options={{ animation: false, responsive: true }} />;
}
