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
    const simulation = (window as any).simulation as Simulation;
    if (e.key === " ") {
        simulation.autoRun = !simulation.autoRun;
        simulation.runAutomatically();
    }
    if (e.key === "r") {
        simulation.reset();
        simulation.autoRun = false;
    }
    if (e.key === "Enter") {
        e.stopPropagation();
        e.preventDefault();
        simulation.autoRun = false;
        simulation.step();
    }
};
