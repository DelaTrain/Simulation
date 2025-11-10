export default class SimulationEvent<T = void> {
    callbacks: ((arg: T) => void)[] = [];

    subscribe(callback: () => void) {
        this.callbacks.push(callback);
    }

    emit(arg: T) {
        this.callbacks.forEach((callback) => callback(arg));
    }
}
