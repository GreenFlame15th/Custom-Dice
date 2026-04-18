import './style.css';
import * as BABYLON from '@babylonjs/core';
import { DieChallenge } from './dieChellange/dieChallenge';

const canvas = document.getElementById('renderCanvas') as HTMLCanvasElement
const engine = new BABYLON.Engine(canvas, true, { stencil: true });
const dieChellange = await DieChallenge.create(engine, canvas);

engine.runRenderLoop(() => {
  dieChellange.render();
});

window.addEventListener("resize", () => {
  engine.resize();
});