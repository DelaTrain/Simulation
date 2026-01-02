import { useState } from "react";
import { categoryManager } from "../../../utils/categories";
import CategorySettings from "./CategorySetting";

export default function CategoryTab() {
    const [openCategory, setOpenCategory] = useState(null as string | null);

    return (
        <>
            {categoryManager.getCategories().map((category) => (
                <CategorySettings
                    key={category.name}
                    category={category}
                    isCollapsed={category.name !== openCategory}
                    onToggle={() => setOpenCategory((c) => (c === category.name ? null : category.name))}
                />
            ))}
        </>
    );
}
