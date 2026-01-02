import SimulationEvent from "./event";

function getDataUrl(name: string): string {
    return new URL(`../../data/${name}.json`, import.meta.url).href;
}

function isObject(item: any): boolean {
    return item && typeof item === "object" && !Array.isArray(item);
}

function deepMerge(target: any, ...sources: any[]) {
    if (!sources.length) return target;
    const source = sources.shift();

    if (Array.isArray(target) && Array.isArray(source)) {
        target.push(...source);
    } else if (isObject(target) && isObject(source)) {
        for (const key in source) {
            if (Object.prototype.hasOwnProperty.call(source, key)) {
                const sourceValue = source[key];
                if (isObject(sourceValue) && isObject(target[key])) {
                    target[key] = deepMerge(target[key], sourceValue);
                } else {
                    target[key] = sourceValue;
                }
            }
        }
    }
    return deepMerge(target, ...sources);
}

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

    async loadIndex() {
        const indexUrl = getDataUrl("index");
        const response = await fetch(indexUrl);
        const indexData = await response.json();
        return indexData;
    }

    async loadChunk(chunkName: string) {
        const chunkUrl = getDataUrl(chunkName);
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
        return deepMerge({}, ...chunks);
    }
}
