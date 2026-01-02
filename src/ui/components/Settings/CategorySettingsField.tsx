import { useEffect, useState } from "react";
import type { EditableTrainCategoryFields, TrainCategory } from "../../../core/trainCategory";

interface CategorySettingsFieldProps {
    field: EditableTrainCategoryFields;
    label: string;
    unit: string;
    category: TrainCategory;
}

export default function CategorySettingsField({ field, label, unit, category }: CategorySettingsFieldProps) {
    const [value, setValue] = useState(category[field]);
    useEffect(() => {
        category[field] = value;
    }, [value, field, category]);

    return (
        <div className="flex flex-row justify-between py-1">
            <span>{label}:</span>
            <span className="flex flex-row items-center">
                <input
                    type="number"
                    value={value}
                    className="bg-stone-700 p-1 rounded w-20 text-right"
                    onChange={(e) => setValue(parseFloat(e.currentTarget.value))}
                />
                <span className="ml-2 w-[5ch]">{unit}</span>
            </span>
        </div>
    );
}
