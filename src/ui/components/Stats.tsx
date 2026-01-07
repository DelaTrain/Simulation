import useStatsCollectorTotal from "../hooks/useStatsCollectorTotal";
import Chart from "./Chart";
import { FaTimes } from "react-icons/fa";
import Collapsable from "./Collapsable";
import StationChart from "./StationChart";
import { statsCollector } from "../../utils/stats";

interface StatsProps {
    onClose?: () => void;
}

export default function Stats({ onClose }: StatsProps) {
    const { trainsAlive, averageLatency } = useStatsCollectorTotal();
    return (
        <div className="fixed top-0 right-0 m-4 p-3 bg-stone-900 md:w-lg max-w-11/12  text-white backdrop-blur-md rounded-lg shadow-md z-10">
            <button className="absolute top-2 right-2 btn btn-icon btn-sm" onClick={onClose}>
                <FaTimes />
            </button>
            <h3 className="text-xl font-bold mb-2">Simulation Stats</h3>
            <div className="overflow-y-auto h-panel">
                <div className="flex flex-col gap-1">
                    <Chart statistic="trainsAlive" title="Trains Count" />
                    <div>
                        Average Trains Alive: <span className="font-bold">{trainsAlive.toFixed(3)}</span>
                    </div>
                    <Chart statistic="averageLatency" title="Average Delay" />
                    <div>
                        Average Delay: <span className="font-bold">{averageLatency.toFixed(3)}</span>
                    </div>
                </div>
                {Array.from(statsCollector.stationsStats.values()).map((s) => (
                    <Collapsable title={s.station.name} key={s.station.name}>
                        <StationChart
                            station={s.station}
                            statistic={[
                                { key: "trainsArrived", title: "Arrived" },
                                { key: "trainsDeparted", title: "Departed" },
                            ]}
                        />
                        <StationChart
                            station={s.station}
                            statistic={[
                                { key: "trainsDelayed", title: "Delayed" },
                                { key: "trainsInStation", title: "In Station" },
                            ]}
                        />
                        <StationChart
                            station={s.station}
                            statistic={[{ key: "sumOfDelays", title: "Sum of delays" }]}
                        />
                    </Collapsable>
                ))}
            </div>
        </div>
    );
}
