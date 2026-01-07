interface TooltipProps {
    content: string;
    children: React.ReactNode;
}

export default function Tooltip({ content, children }: TooltipProps) {
    const size = `${content.length + 2}ch`;
    return (
        <div className="relative tooltip-container ">
            <span
                style={{ width: size }}
                className={
                    "tooltip bg-stone-700 z-10 absolute px-1 py-0.5 rounded text-center text-sm bottom-full mb-1.5 left-1/2 -translate-x-1/2"
                }
            >
                {content}
            </span>
            {children}
        </div>
    );
}
