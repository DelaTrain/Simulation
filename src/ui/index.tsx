import { createRoot } from "react-dom/client";
import { StrictMode } from "react";
import App from "./components/App";
import type { Simulation } from "../core/simulation";

createRoot(document.getElementById("ui")!).render(
    <StrictMode>
        <App />
    </StrictMode>
);

document.getElementById("map")!.onkeyup = (e) => {
    if (e.key === " ") {
        const simulation = (window as any).simulation as Simulation;
        simulation.autoRun = !simulation.autoRun;
        simulation.runAutomatically();
    }
};
