import { useEffect, useState } from "react";
import { Train } from "../../core/train";
import { Station } from "../../core/station";
import { simulation } from "../../core/simulation";
import Fuse from "fuse.js";
import useRenderer from "../hooks/useRenderer";

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

    useEffect(() => {
        if (searchText.length > 0) {
            const results = search(searchText);
            setSearchResults(results);
        } else {
            setSearchResults([]);
        }
    }, [searchText]);

    return (
        <div className="fixed top-0 left-0 w-full flex items-center justify-center pointer-events-none z-10">
            <input
                type="text"
                placeholder="Search..."
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                className="mt-4 w-md p-2 rounded-lg border border-gray-300 pointer-events-auto bg-stone-900 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {searchText.length > 0 && (
                <div className="fixed top-0 mt-15 max-h-2/5 overflow-y-scroll w-md bg-stone-800 border border-gray-300 rounded-lg pointer-events-auto">
                    {searchResults.map((result, index) => (
                        <div
                            key={index}
                            className="p-2 hover:bg-stone-700 cursor-pointer text-white"
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
                            {result instanceof Station ? `Station: ${result.name}` : `Train: ${result.displayName()}`}
                        </div>
                    ))}
                    {searchResults.length === 0 && <div className="p-2 text-white">No results found.</div>}
                </div>
            )}
        </div>
    );
}
