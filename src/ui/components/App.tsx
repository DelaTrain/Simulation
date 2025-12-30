import { useState } from "react";
import Controls from "./Controls";
import Loading from "./Loading";
import Stats from "./Stats";
import InfoPanel from "./InfoPanel";

export default function App() {
    const [openStats, setOpenStats] = useState(false);

    return (
        <>
            <Loading />
            <Controls
                onToggleStats={() => {
                    setOpenStats((s) => !s);
                }}
            />
            {openStats && <Stats onClose={() => setOpenStats(false)} />}
            <InfoPanel />
        </>
    );
}
