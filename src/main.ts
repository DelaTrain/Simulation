import "./app.ts";
import "./index.css";
import "./loader.ts";
import { Renderer } from "./renderer.ts";
import { simulation } from "./core/simulation.ts";

new Renderer(simulation);
(window as any).simulation = simulation; // for debug purposes
