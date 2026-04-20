import "./style.css";
import { DieChallenge } from "./dieChellange/dieChallenge";
import { Engine } from "@babylonjs/core";

const canvas = document.getElementById("renderCanvas") as HTMLCanvasElement;
const engine = new Engine(canvas, true, { stencil: true });
const dieChellange = await DieChallenge.create(engine, canvas);

engine.runRenderLoop(() => {
  dieChellange.render();
});

window.addEventListener("resize", () => {
  engine.resize();
});
