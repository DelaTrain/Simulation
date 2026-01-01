import { FaTimes } from "react-icons/fa";
import { categoryManager } from "../../utils/categories";
import CategorySettings from "./CategorySetting";
import { useState } from "react";

interface SettingsProps {
    onClose?: () => void;
}

export default function Settings({ onClose }: SettingsProps) {
    const [openCategory, setOpenCategory] = useState(null as string | null);

    return (
        <div
            className="fixed top-0 left-0 h-screen w-screen bg-black/50 backdrop-blur-sm flex justify-center z-20 "
            onClick={onClose}
        >
            <div
                className="bg-stone-900 text-white rounded-lg p-6 mt-20 w-1/2 h-2/3 shadow-lg relative"
                onClick={(e) => e.stopPropagation()}
            >
                <button className="absolute top-2 right-2 btn btn-icon btn-sm " onClick={onClose}>
                    <FaTimes />
                </button>
                <h2 className="text-2xl mb-4">Settings</h2>
                <div className="overflow-y-auto pr-2" style={{ maxHeight: "calc(100% - 3rem)" }}>
                    {categoryManager.getCategories().map((category) => (
                        <CategorySettings
                            key={category.name}
                            category={category}
                            isCollapsed={category.name !== openCategory}
                            onToggle={() => setOpenCategory((c) => (c === category.name ? null : category.name))}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
}
