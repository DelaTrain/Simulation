import { Loader } from "./loader";
import { getDataUrl } from "./url";

export class DatasetsLoader {
    public datasets: string[] = [];

    async load() {
        const indexUrl = getDataUrl(`/index.json`);
        const response = await fetch(indexUrl);
        const indexData = await response.json();
        this.datasets = indexData.datasets;
    }

    async getDatasets(): Promise<string[]> {
        if (this.datasets.length === 0) {
            await this.load();
        }
        return this.datasets;
    }

    makeLoader(datasetName: string): Loader {
        return new Loader(`/${datasetName}`);
    }
}

export const datasetsLoader = new DatasetsLoader();
