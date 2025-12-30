import { useEffect, useState } from "react";
import { Loader } from "../../utils/loader";
import { ImportedData } from "../../utils/importer";
import { simulation } from "../../core/simulation";

export default function Loading() {
    const [progress, setProgress] = useState(0);
    const [error, setError] = useState<string | null>(null);
    const [visible, setVisible] = useState(true);

    useEffect(() => {
        console.log("Loading simulation data...");
        const loader = new Loader();
        loader.update.subscribe((info) => {
            setProgress(info.progress);
        });
        loader
            .load()
            .then(() => {
                const importedData = new ImportedData(loader.data);
                simulation.loadData(importedData);
                setVisible(false);
            })
            .catch((err) => {
                setError(err.message);
            });
    }, []);

    if (!visible) {
        return null;
    }

    return (
        <div className="fixed flex flex-col justify-center items-center top-0 left-0 w-full h-full bg-black/80 text-white z-50">
            <div className="flex flex-col gap-4 items-center">
                <h2 className="text-xl">Loading...</h2>
                <progress className="w-sm" value={progress} max="1"></progress>
                <p className="text-lg text-red-600" id="error">
                    {error}
                </p>
            </div>
        </div>
    );
}
