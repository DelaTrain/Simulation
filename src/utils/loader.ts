import SimulationEvent from "./event";
import { getDataUrl } from "./url";

enum LoadStatus {
    IDLE,
    LOADING,
    DONE,
    ERROR,
}

interface LoaderInfo {
    status: LoadStatus;
    progress: number;
}

export class Loader {
    chunks: any[] = [];
    progress: number = 0;
    toLoad: number = 0;
    data: any = null;
    status: LoadStatus = LoadStatus.IDLE;
    error: any = null;
    update: SimulationEvent<LoaderInfo> = new SimulationEvent();
    constructor(private path: string) {}

    async loadIndex() {
        const indexUrl = getDataUrl(`${this.path}/index.json`);
        const response = await fetch(indexUrl);
        const indexData = await response.json();
        return indexData;
    }

    async loadChunk(chunkName: string) {
        const chunkUrl = getDataUrl(`${this.path}/${chunkName}.json`);
        const response = await fetch(chunkUrl);
        const chunkData = await response.json();
        this.progress += 1;
        this.emitUpdate();
        return chunkData;
    }

    async load() {
        this.error = null;
        this.data = null;
        this.progress = 0;
        this.toLoad = 1;
        this.status = LoadStatus.LOADING;

        try {
            const indexData = await this.loadIndex();
            this.toLoad = indexData.chunks.length;
            this.emitUpdate();
            const chunkPromises = indexData.chunks.map((chunkName: string) => this.loadChunk(chunkName));
            this.chunks = await Promise.all(chunkPromises);
            this.data = this.mergeData(this.chunks);
            this.status = LoadStatus.DONE;
            this.emitUpdate();
        } catch (error) {
            this.error = error;
            this.data = null;
            this.progress = 0;
            this.toLoad = 0;
            console.error("Error loading data:", error);
            this.status = LoadStatus.ERROR;
            this.emitUpdate();
        }
    }

    emitUpdate() {
        this.update.emit({
            status: this.status,
            progress: this.toLoad === 0 ? 0 : this.progress / this.toLoad,
        });
    }

    mergeData(chunks: any[]): any {
        if (chunks.some((chunk) => chunk.day !== chunks[0].day)) {
            throw new Error("Cannot merge chunks from different days");
        }
        return (chunks = chunks.reduce(
            (merged, chunk) => {
                if (chunk.stations !== undefined) merged.stations.push(...chunk.stations);
                if (chunk.rails !== undefined) merged.rails.push(...chunk.rails);
                if (chunk.trains !== undefined) merged.trains.push(...chunk.trains);
                return merged;
            },
            { stations: [], rails: [], trains: [], day: this.chunks[0].day }
        ));
    }
}
