import { useEffect, useState } from "react";
import type { EditableTrainCategoryFields, TrainCategory } from "../../core/trainCategory";

interface CategorySettingsFieldProps {
    field: EditableTrainCategoryFields;
    label: string;
    category: TrainCategory;
}

export default function CategorySettingsField({ field, label, category }: CategorySettingsFieldProps) {
    const [value, setValue] = useState(category[field]);
    useEffect(() => {
        category[field] = value;
    }, [value, field, category]);

    return (
        <div className="flex flex-row justify-between py-1">
            <span>{label}:</span>
            <input
                type="number"
                value={value}
                className="bg-stone-700 p-1 rounded w-20 text-right"
                onChange={(e) => setValue(parseFloat(e.currentTarget.value))}
            />
        </div>
    );
}
