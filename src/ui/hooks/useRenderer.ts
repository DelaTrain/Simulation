import { useEffect } from "react";
import type { Renderer, RendererClickEvent } from "../renderer";

export default function useRenderer(onClick: (event: RendererClickEvent) => void = () => {}) {
    const renderer = (window as any).renderer as Renderer;
    useEffect(() => {
        const handleClick = (event: RendererClickEvent) => {
            onClick(event);
        };

        renderer.clickEvent.subscribe(handleClick);
        return () => {
            renderer.clickEvent.unsubscribe(handleClick);
        };
    }, [onClick]);
    return renderer;
}
