import { simulation } from "./core/simulation";

const timeEle = document.getElementById("time")!;
const stepButton = document.getElementById("step-button")!;
const restartButton = document.getElementById("restart-button")!;
const autoRunButton = document.getElementById("autorun-button")!;

export function updateTime() {
    timeEle.textContent = `Czas symulacji: ${simulation.currentTime.toString()}`;
}

stepButton.addEventListener("click", () => {
    simulation.step();
});

restartButton.addEventListener("click", () => {
    simulation.reset();
    updateTime();
});

autoRunButton.addEventListener("click", () => {
    if (simulation.autoRun) {
        simulation.autoRun = false;
        autoRunButton.textContent = "Play";
    } else {
        simulation.autoRun = true;
        autoRunButton.textContent = "Pause";
        simulation.runAutomatically();
    }
});

simulation.stepEvent.subscribe(updateTime);
updateTime();
