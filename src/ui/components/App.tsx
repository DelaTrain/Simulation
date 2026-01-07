import { useRef, useState } from "react";
import Controls from "./Controls";
import Loading from "./Loading";
import Stats from "./Stats";
import InfoPanel, { type InfoPanelRef } from "./InfoPanel";
import Search from "./Search";
import Settings from "./Settings/Settings";
import DatasetPicker from "./DatasetPicker";

export default function App() {
    const [openStats, setOpenStats] = useState(false);
    const [openSettings, setOpenSettings] = useState(false);
    const [dataset, setDataset] = useState(null as string | null);
    const ref = useRef<InfoPanelRef>(null);

    return (
        <>
            <DatasetPicker onPickDataset={setDataset} />
            <Loading dataset={dataset} />
            <Controls
                onToggleStats={() => {
                    setOpenStats((s) => !s);
                }}
                onToggleSettings={() => {
                    setOpenSettings((s) => !s);
                }}
            />
            {openStats && <Stats onClose={() => setOpenStats(false)} />}
            {openSettings && <Settings onClose={() => setOpenSettings(false)} />}
            <InfoPanel ref={ref} />
            <Search
                setInfoPanelObject={(ele) => {
                    ref.current?.setSelected(ele);
                }}
            />
        </>
    );
}
