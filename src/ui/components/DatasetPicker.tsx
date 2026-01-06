import { useEffect, useState } from "react";
import { datasetsLoader } from "../../utils/datasets";

interface DatasetPickerProps {
    onPickDataset: (datasetName: string) => void;
}

export default function DatasetPicker({ onPickDataset }: DatasetPickerProps) {
    const [datasets, setDatasets] = useState<string[]>([]);
    const [visible, setVisible] = useState(true);

    useEffect(() => {
        datasetsLoader.getDatasets().then((loadedDatasets) => {
            setDatasets(loadedDatasets);
        });
    });

    if (!visible) {
        return null;
    }

    return (
        <div className="fixed flex flex-col justify-center items-center top-0 left-0 w-full h-full bg-black/80 text-white z-90">
            {datasets.length === 0 ? (
                <div>Loading datasets...</div>
            ) : (
                <>
                    <h2 className="text-2xl mb-4">Select Dataset</h2>
                    {datasets.map((dataset) => (
                        <div
                            className="p-2 bg-stone-900 rounded-lg m-2 w-sm max-w-11/12 text-center hover:bg-blue-500 cursor-pointer transition-colors"
                            key={dataset}
                            onClick={() => {
                                onPickDataset(dataset);
                                setVisible(false);
                            }}
                        >
                            {dataset}
                        </div>
                    ))}
                </>
            )}
        </div>
    );
}
