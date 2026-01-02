import { MdOutlineKeyboardArrowDown, MdOutlineKeyboardArrowRight } from "react-icons/md";
import type { TrainCategory } from "../../../core/trainCategory";
import CategorySettingsField from "./CategorySettingsField";

interface CategorySettingsProps {
    category: TrainCategory;
    isCollapsed?: boolean;
    onToggle?: () => void;
}

export default function CategorySettings({ category, isCollapsed, onToggle }: CategorySettingsProps) {
    return (
        <div className="border-b border-stone-700 ">
            <div className="flex flex-row items-center gap-2 py-2 cursor-pointer" onClick={onToggle}>
                {isCollapsed ? <MdOutlineKeyboardArrowRight /> : <MdOutlineKeyboardArrowDown />} {category.fullName}
            </div>
            {!isCollapsed && (
                <div className="pl-6 pb-4 text-sm opacity-80 pr-4">
                    <CategorySettingsField field="UIPriority" label="Priority" category={category} unit="" />
                    <CategorySettingsField
                        field="UIMaxWaitingTime"
                        label="Max Waiting Time"
                        category={category}
                        unit="s"
                    />
                    <CategorySettingsField field="UIMaxVelocity" label="Max Velocity" category={category} unit="m/s" />
                    <CategorySettingsField
                        field="UIAcceleration"
                        label="Acceleration"
                        category={category}
                        unit="m/s²"
                    />
                </div>
            )}
        </div>
    );
}
