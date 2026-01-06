import { FaTimes } from "react-icons/fa";
import { useState } from "react";
import CategoryTab from "./CategoryTab";
import GeneralTab from "./GeneralTab";
import KeybindsTab from "./KeybindsTab";

interface SettingsProps {
    onClose?: () => void;
}

const SETTINGS_TABS = [
    {
        name: "General",
        component: GeneralTab,
    },
    {
        name: "Categories",
        component: CategoryTab,
    },
    {
        name: "Keybinds",
        component: KeybindsTab,
    },
];

export default function Settings({ onClose }: SettingsProps) {
    const [selectedTab, setSelectedTab] = useState(0);

    const TabComponent = SETTINGS_TABS[selectedTab].component;
    return (
        <div
            className="fixed top-0 left-0 h-screen w-screen bg-black/50 backdrop-blur-sm flex justify-center items-center z-20 "
            onClick={onClose}
        >
            <div
                className="bg-stone-900 text-white rounded-lg p-6 lg:w-1/2 lg:h-2/3 w-11/12 h-10/12 shadow-lg relative"
                onClick={(e) => e.stopPropagation()}
            >
                <button className="absolute top-2 right-2 btn btn-icon btn-sm " onClick={onClose}>
                    <FaTimes />
                </button>
                <h2 className="text-2xl mb-4">Settings</h2>
                <div className="flex flex-row mb-4 border-b border-stone-700 ">
                    {SETTINGS_TABS.map((tab, index) => (
                        <button
                            key={tab.name}
                            className={`mr-4 pb-2  ${
                                selectedTab === index
                                    ? "border-b-2 border-blue-500 font-semibold "
                                    : "text-stone-400 hover:text-white cursor-pointer"
                            }`}
                            onClick={() => setSelectedTab(index)}
                        >
                            {tab.name}
                        </button>
                    ))}
                </div>
                <div className="overflow-y-auto pr-2 w-full" style={{ maxHeight: "calc(100% - 6rem)" }}>
                    <TabComponent />
                </div>
            </div>
        </div>
    );
}
