import { simulation } from "./core/simulation";
import { ImportedData } from "./utils/importer";
import { Loader } from "./utils/loader";

const loaderEle = document.getElementById("loader") as HTMLDivElement;
const loaderProgressEle = document.getElementById("loaderProgress") as HTMLProgressElement;
const errorEle = document.getElementById("error") as HTMLParagraphElement;

const loader = new Loader();

loader.update.subscribe((info) => {
    loaderProgressEle.value = info.progress;
});

async function loadSimulationData() {
    loaderEle.style.display = "flex";
    try {
        await loader.load();
        const importedData = new ImportedData(loader.data);
        simulation.loadData(importedData);
        loaderEle.style.display = "none";
    } catch (error) {
        loaderProgressEle.style.display = "none";
        errorEle.innerText = `${error}`;
        throw error;
    }
}

loadSimulationData();
