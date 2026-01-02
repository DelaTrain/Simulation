import { useState, useCallback } from "react";

//TODO: Replace with real useHistoryNavigation
export function useDummyHistoryNavigation<T>(initialState: T[] = []) {
    const [state, setState] = useState<T[]>(initialState);

    const updateState = useCallback(
        (newState: (prevState: T[]) => T[] | T[]) => {
            setState((prevState) => {
                const updatedState = typeof newState === "function" ? newState(prevState) : newState;
                return updatedState;
            });
        },
        [setState]
    );

    const addState = useCallback(
        (newEntry: T) => {
            updateState((prevState) => [...prevState, newEntry]);
        },
        [updateState]
    );

    return [state, updateState, addState] as const;
}
