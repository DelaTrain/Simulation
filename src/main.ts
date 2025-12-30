import "./ui/index.tsx";
import "./css/index.css";
import { Renderer } from "./ui/renderer.ts";
import { simulation } from "./core/simulation.ts";

new Renderer(simulation);
(window as any).simulation = simulation; // for debug purposes
