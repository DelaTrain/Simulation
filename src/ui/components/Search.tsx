import { useEffect, useRef, useState } from "react";
import { Train } from "../../core/train";
import { Station } from "../../core/station";
import { simulation } from "../../core/simulation";
import Fuse from "fuse.js";
import useRenderer from "../hooks/useRenderer";
import { FaLocationDot, FaTrainSubway } from "react-icons/fa6";

type SearchResult = Train | Station;
type SearchResultObject = {
    name: string;
    value: SearchResult;
};

function makeSearch(): Fuse<SearchResultObject> {
    const stations = Array.from(simulation.stations.entries()).map(([key, station]) => ({
        name: key,
        value: station,
    }));

    const trains = simulation.trains.map((train) => ({
        name: train.displayName(),
        value: train,
    }));
    const fuse = new Fuse([...stations, ...trains], {
        keys: ["name"],
        threshold: 0.3,
    });
    return fuse;
}

function search(query: string): Array<SearchResult> {
    return makeSearch() // TODO: Cache Fuse instance
        .search(query)
        .sort((a, b) => a.score! - b.score!)
        .map((result) => result.item.value);
}

export default function Search() {
    const [searchText, setSearchText] = useState("");
    const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
    const renderer = useRenderer();
    const ref = useRef<HTMLInputElement>(null);

    const keyDownHandler = (event: KeyboardEvent) => {
        if (event.ctrlKey && event.key === "/") ref.current?.focus();
    };

    useEffect(() => {
        window.addEventListener("keydown", keyDownHandler);
    });

    useEffect(() => {
        if (searchText.length > 0) {
            const results = search(searchText);
            setSearchResults(results);
        } else {
            setSearchResults([]);
        }
    }, [searchText]);

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
                        if (result instanceof Station) {
                            renderer.focusOnPosition(result.position.latitude, result.position.longitude);
                        } else if (result instanceof Train) {
                            renderer.focusOnPosition(
                                result.position.getPosition().latitude,
                                result.position.getPosition().longitude
                            );
                        }
                        setSearchText("");
                        ref.current?.blur();
                    }
                }}
                ref={ref}
                className="mt-4 w-md p-2 rounded-lg  pointer-events-auto bg-stone-900 text-white focus:outline-none border-2 border-transparent focus:border-blue-500 "
            />
            {searchText.length > 0 && (
                <div className="fixed top-16 max-h-2/5 overflow-y-auto w-md max-w-full bg-stone-800 rounded-lg pointer-events-auto">
                    {searchResults.map((result, index) => (
                        <div
                            key={index}
                            className="p-2 hover:bg-stone-700 cursor-pointer text-white border-b border-stone-700 pt-3"
                            onClick={() => {
                                if (result instanceof Station) {
                                    renderer.focusOnPosition(result.position.latitude, result.position.longitude);
                                } else if (result instanceof Train) {
                                    renderer.focusOnPosition(
                                        result.position.getPosition().latitude,
                                        result.position.getPosition().longitude
                                    );
                                }
                                setSearchText("");
                            }}
                        >
                            {result instanceof Station ? (
                                <span className="flex flex-row gap-1 items-center">
                                    <FaLocationDot />
                                    {result.name}
                                </span>
                            ) : (
                                <span className="flex flex-row gap-1 items-center">
                                    <FaTrainSubway />
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
