import { simulation } from "../core/simulation";

const timeEle = document.getElementById("time")!;
const stepButton = document.getElementById("step-button")!;
const restartButton = document.getElementById("restart-button")!;
const autoRunButton = document.getElementById("autorun-button")!;
const stepSizeSlider = document.getElementById("step")!;
const playSpeedSlider = document.getElementById("speed")!;
const stepValue = document.getElementById("step-value")!;
const speedValue = document.getElementById("speed-value")!;

function updateSliders() {
    (stepSizeSlider as HTMLInputElement).value = simulation.timeStep.toString();
    (playSpeedSlider as HTMLInputElement).value = simulation.autoRunSpeed.toString();
    stepValue.textContent = `${simulation.timeStep} s`;
    speedValue.textContent = `${simulation.autoRunSpeed} ms`;
}

function toggleAutoRunButton() {
    simulation.autoRun = !simulation.autoRun;
    autoRunButton.textContent = simulation.autoRun ? "Pause" : "Play";
    simulation.runAutomatically();
}

function updateTime() {
    timeEle.textContent = `Czas symulacji: ${simulation.currentTime.toString()}`;
}

stepButton.addEventListener("click", () => {
    simulation.step();
    if (simulation.autoRun) {
        toggleAutoRunButton();
    }
});

restartButton.addEventListener("click", () => {
    simulation.reset();
    if (simulation.autoRun) {
        toggleAutoRunButton();
    }
    updateTime();
});

autoRunButton.addEventListener("click", () => {
    toggleAutoRunButton();
});

stepSizeSlider.addEventListener("input", () => {
    const stepSize = parseInt((stepSizeSlider as HTMLInputElement).value);
    simulation.timeStep = stepSize;
    updateSliders();
});

playSpeedSlider.addEventListener("input", () => {
    const playSpeed = parseInt((playSpeedSlider as HTMLInputElement).value);
    simulation.autoRunSpeed = playSpeed;
    updateSliders();
});

simulation.stepEvent.subscribe(updateTime);
updateTime();
updateSliders();
