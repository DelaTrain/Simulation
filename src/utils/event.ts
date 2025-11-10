export default class SimulationEvent<T = void> {
    callbacks: ((arg: T) => void)[] = [];

    subscribe(callback: (arg: T) => void) {
        this.callbacks.push(callback);
    }

    unsubscribe(callback: (arg: T) => void) {
        this.callbacks = this.callbacks.filter((cb) => cb !== callback);
    }

    emit(arg: T) {
        this.callbacks.forEach((callback) => callback(arg));
    }
}
