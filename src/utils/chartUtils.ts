import type { Time } from "./time";

export function makeData(stats: { labels: Time[]; data: number[] }, title: string) {
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

export function makeMultipleData(statsArray: { labels: Time[]; data: number[][]; title: string[] }) {
    const labels = statsArray.labels.map((t) => t.toString());

    const datasets = statsArray.data.map((stats, index) => {
        const colorValue = Math.floor((index / statsArray.data.length) * 255);
        return {
            label: statsArray.title[index],
            data: stats,
            borderColor: `rgba(${colorValue}, ${100 + colorValue / 2}, ${255 - colorValue}, 1)`,
            backgroundColor: `rgba(${colorValue}, ${100 + colorValue / 2}, ${255 - colorValue}, 0.2)`,
            fill: true,
            pointRadius: 0,
        };
    });

    return { labels, datasets };
}
