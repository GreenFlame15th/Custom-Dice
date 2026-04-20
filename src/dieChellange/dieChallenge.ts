import {
  Engine,
  Scene,
  Color4,
  HavokPlugin,
  Vector3,
  ArcRotateCamera,
  PointLight,
  KeyboardEventTypes,
  PointerEventTypes,
  Camera,
  HighlightLayer,
} from "@babylonjs/core";
import {
  Rectangle,
  Control,
  AdvancedDynamicTexture,
  TextBlock,
} from "@babylonjs/gui/2D";
import HavokPhysics from "@babylonjs/havok";
import { Die } from "./die";
import { SpiritBox } from "./spiritBox";
import { PlayerHand } from "./playerHand";
import { ReRollCard } from "./Cards/reRollCard";
import { DieManager } from "./dieManager";

export class DieChallenge extends Scene {
  public dieManager: DieManager;
  public hand!: PlayerHand;
  public spiritBox!: SpiritBox;
  public camera!: ArcRotateCamera;
  public highlightLayer: HighlightLayer;

  private constructor(
    public engine: Engine,
    public canvas: HTMLCanvasElement,
  ) {
    super(engine);
    this.dieManager = new DieManager();
    this.highlightLayer = new HighlightLayer("dieHighlight", this);
    this.highlightLayer.innerGlow = false;
    this.highlightLayer.outerGlow = true;
    this.highlightLayer.blurHorizontalSize = 1;
    this.highlightLayer.blurVerticalSize = 1;
  }

  public static async create(engine: Engine, canvas: HTMLCanvasElement) {
    const dieChallenge = new DieChallenge(engine, canvas);
    await dieChallenge.init();
    return dieChallenge;
  }

  private async init() {
    this.clearColor = new Color4(0.02, 0.0, 0.05, 1);

    await this.setupPhysics();
    this.setupCamera();
    this.setupLights();

    this.spiritBox = new SpiritBox(this);
    this.hand = new PlayerHand(this);
    this.setupObservables();
    this.dieManager.setUpDice(this);

    this.hand.reSet();

    return this;
  }

  private async setupPhysics() {
    const havokInstance = await HavokPhysics();
    const hk = new HavokPlugin(true, havokInstance);
    this.enablePhysics(new Vector3(0, -9.81, 0), hk);
  }

  private setupCamera() {
    this.camera = new ArcRotateCamera(
      "camera",
      -Math.PI / 2.5,
      Math.PI / 3,
      15,
      Vector3.Zero(),
      this,
    );
    this.camera.attachControl(this.canvas, true);
    this.camera.panningSensibility = 0;
    this.camera.lowerRadiusLimit = 6;
    this.camera.upperRadiusLimit = 30;
  }

  private setupLights() {
    const light = new PointLight("light", new Vector3(0, 8, 0), this);
    light.intensity = 1.5;
  }

  private setupObservables() {
    this.onPointerObservable.add((pointerInfo) => {
      switch (pointerInfo.type) {
        case PointerEventTypes.POINTERDOWN:
          this.hand.OnPointerDown();
          break;
        case PointerEventTypes.POINTERUP:
          this.hand.OnPointerUp();
          break;
        case PointerEventTypes.POINTERMOVE:
          this.hand.PointerMove();
          break;
      }
    });

    this.onBeforeRenderObservable.add(this.dieManager.updateDiceSum);
    this.onBeforeRenderObservable.add(this.hand.OnUpdate);
  }
}
