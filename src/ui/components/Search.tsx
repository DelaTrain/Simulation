import { useEffect, useRef, useState } from "react";
import { Train } from "../../core/train";
import { Station } from "../../core/station";
import { simulation } from "../../core/simulation";
import Fuse from "fuse.js";
import useRenderer from "../hooks/useRenderer";
import { FaLocationDot, FaTrainSubway } from "react-icons/fa6";
import { TrainTemplate } from "../../core/trainTemplate";
import useSimulationEvent from "../hooks/useSimulationEvent";

type SearchResult = Train | Station | TrainTemplate;
type SearchResultObject = {
    name: string;
    value: { exists: boolean; value: SearchResult };
};

function makeSearch(): Fuse<SearchResultObject> {
    const stations = Array.from(simulation.stations.entries()).map(([key, station]) => ({
        name: key,
        value: { exists: false, value: station },
    }));

    const trains = simulation.trainTemplates.map((train) => {
        return {
            name: train.displayName(),
            value: { exists: train.train !== null, value: train.train || train },
        };
    });

    const fuse = new Fuse([...stations, ...trains], {
        keys: ["name"],
        threshold: 0.3,
        useExtendedSearch: true,
    });
    return fuse;
}

function search(query: string, searchObject: Fuse<SearchResultObject>): Array<SearchResult> {
    return searchObject
        .search(query)
        .sort((a, b) =>
            a.item.value.exists == b.item.value.exists ? a.score! - b.score! : a.item.value.exists ? -1 : 1
        )
        .map((result) => result.item.value.value);
}

interface SearchProps {
    setInfoPanelObject: (obj: SearchResult | null) => void;
}

export default function Search({ setInfoPanelObject }: SearchProps) {
    const [searchText, setSearchText] = useState("");
    const [searchObject, setSearchObject] = useState<Fuse<SearchResultObject>>(makeSearch());
    const [searchResults, setSearchResults] = useState<SearchResult[]>([]);

    const ref = useRef<HTMLInputElement>(null);

    const keyDownHandler = (event: KeyboardEvent) => {
        if (event.ctrlKey && event.key === "/") ref.current?.focus();
    };

    useEffect(() => {
        window.addEventListener("keydown", keyDownHandler);
    });

    useEffect(() => {
        if (searchText.length > 0) {
            const results = search(searchText, searchObject);
            setSearchResults(results);
        } else {
            setSearchResults([]);
        }
    }, [searchText, searchObject]);

    return (
        <div className="fixed top-0 left-0 w-full flex items-center justify-center pointer-events-none">
            <input
                type="text"
                placeholder="Search..."
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                onKeyDown={(e) => {
                    if (e.key === "Escape") {
                        setSearchText("");
                        ref.current?.blur();
                    } else if (e.key === "Enter" && searchResults.length > 0) {
                        const result = searchResults[0];
                        setInfoPanelObject(result);
                        setSearchText("");
                        ref.current?.blur();
                    }
                }}
                onFocus={() => {
                    setSearchObject(makeSearch());
                }}
                ref={ref}
                className="mt-4 w-md p-2 rounded-lg max-w-11/12 pointer-events-auto bg-stone-900 text-white focus:outline-none border-2 border-transparent focus:border-blue-500 "
            />
            {searchText.length > 0 && (
                <div className="fixed top-16 max-h-2/5 overflow-y-auto w-md max-w-11/12 bg-stone-800 rounded-lg pointer-events-auto">
                    {searchResults.map((result, index) => (
                        <div
                            key={index}
                            className="p-2 hover:bg-stone-700 cursor-pointer text-white border-b border-stone-700 pt-3"
                            onClick={() => {
                                setInfoPanelObject(result);
                                setSearchText("");
                                ref.current?.blur();
                            }}
                        >
                            {result instanceof Station ? (
                                <span className="flex flex-row gap-1 items-center">
                                    <FaLocationDot />
                                    {result.name}
                                </span>
                            ) : (
                                <span className="flex flex-row gap-1 items-center">
                                    <FaTrainSubway className={result instanceof Train ? "" : "opacity-50"} />
                                    {result.displayName()}
                                </span>
                            )}
                        </div>
                    ))}
                    {searchResults.length === 0 && <div className="p-2 text-white">No results found.</div>}
                </div>
            )}
        </div>
    );
}
