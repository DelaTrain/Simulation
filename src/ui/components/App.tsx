import { useState } from "react";
import Controls from "./Controls";
import Loading from "./Loading";
import Stats from "./Stats";
import InfoPanel from "./InfoPanel";
import Search from "./Search";
import Settings from "./Settings/Settings";

export default function App() {
    const [openStats, setOpenStats] = useState(false);
    const [openSettings, setOpenSettings] = useState(false);

    return (
        <>
            <Loading />
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
            <InfoPanel />
            <Search />
        </>
    );
}
