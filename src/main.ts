import "./ui/index.tsx";
import "./css/index.css";
import { Renderer } from "./ui/renderer.ts";
import { simulation } from "./core/simulation.ts";

const renderer = new Renderer(simulation);

(window as any).simulation = simulation;
(window as any).renderer = renderer;
