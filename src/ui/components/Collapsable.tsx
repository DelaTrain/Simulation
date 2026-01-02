import { useState } from "react";
import { MdOutlineKeyboardArrowDown, MdOutlineKeyboardArrowRight } from "react-icons/md";

interface CollapsableProps {
    title: string;
    className?: string;
    children: React.ReactNode;
}

export default function Collapsable({ title, children, className }: CollapsableProps) {
    const [collapsed, setCollapsed] = useState(true);

    return (
        <div>
            <div
                onClick={() => setCollapsed((c) => !c)}
                className={`flex flex-row items-center gap-1 cursor-pointer ${className ?? ""}`}
            >
                {collapsed ? <MdOutlineKeyboardArrowRight /> : <MdOutlineKeyboardArrowDown />} {title}
            </div>
            {!collapsed && children}
        </div>
    );
}
