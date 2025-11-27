import "./ui/app.ts";
import "./index.css";
import "./ui/loader.ts";
import "./ui/stats.ts";
import { Renderer } from "./ui/renderer.ts";
import { simulation } from "./core/simulation.ts";

new Renderer(simulation);
(window as any).simulation = simulation; // for debug purposes
