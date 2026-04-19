import {
    Engine, Scene, Color4, HavokPlugin, Vector3, ArcRotateCamera,
    PointLight, KeyboardEventTypes, PointerEventTypes,
    Camera,
    HighlightLayer
} from '@babylonjs/core';
import { Rectangle, Control, AdvancedDynamicTexture, TextBlock } from '@babylonjs/gui/2D';
import HavokPhysics from "@babylonjs/havok";
import { Die } from './die';
import { SpiritBox } from './spiritBox';
import { PlayerHand } from './playerHand';
import { ReRollCard } from './reRollCard';

export class DieChallenge extends Scene {
    public dice: Die[] = [];
    public hand!: PlayerHand;
    public spiritBox!: SpiritBox;
    public camera!: ArcRotateCamera;
    private sumText!: TextBlock;
    public highlightLayer: HighlightLayer;

    private constructor(public engine: Engine, public canvas: HTMLCanvasElement) {
        super(engine)
        this.highlightLayer = new HighlightLayer("dieHighlight", this);
        this.highlightLayer.innerGlow = false;
        this.highlightLayer.outerGlow = true;
        this.highlightLayer.blurHorizontalSize = 1;
        this.highlightLayer.blurVerticalSize = 1;
    }

    public static async create(engine: Engine, canvas: HTMLCanvasElement) {
        const dieChallenge = new DieChallenge(engine, canvas);
        await dieChallenge.init();
        return dieChallenge
    }

    private async init() {
        this.clearColor = new Color4(0.02, 0.0, 0.05, 1);

        await this.setupPhysics();
        this.setupCamera();
        this.setupLights();
        this.setupUI();

        this.spiritBox = new SpiritBox(this);
        this.hand = new PlayerHand(this);

        this.setupObservables();

        for (let i = 0; i < 3; i++) {
            this.createDie();
            this.makeCard();
        }

        return this;
    }

    private async setupPhysics() {
        const havokInstance = await HavokPhysics();
        const hk = new HavokPlugin(true, havokInstance);
        this.enablePhysics(new Vector3(0, -9.81, 0), hk);
    }

    private setupCamera() {
        this.camera = new ArcRotateCamera("camera", -Math.PI / 2.5, Math.PI / 3, 15, Vector3.Zero(), this);
        this.camera.attachControl(this.canvas, true);
        this.camera.panningSensibility = 0;
        this.camera.lowerRadiusLimit = 6;
        this.camera.upperRadiusLimit = 30;
    }

    private setupLights() {
        const light = new PointLight("light", new Vector3(0, 8, 0), this);
        light.intensity = 1.5;
    }

    private setupUI() {
        const advancedTexture = AdvancedDynamicTexture.CreateFullscreenUI("UI");

        const panel = new Rectangle();
        panel.width = "220px";
        panel.height = "80px";
        panel.cornerRadius = 10;
        panel.color = "white";
        panel.background = "rgba(0,0,0,0.6)";
        panel.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_RIGHT;
        panel.verticalAlignment = Control.VERTICAL_ALIGNMENT_TOP;
        panel.top = "20px";
        panel.left = "-20px";
        advancedTexture.addControl(panel);

        this.sumText = new TextBlock();
        this.sumText.text = "Sum: 0";
        this.sumText.color = "yellow";
        this.sumText.fontSize = 28;
        panel.addControl(this.sumText);
    }

    private createDie() {
        const die = new Die(this, [1, 1, 1, 10, 10, 10]);
        this.dice.push(die);
    }

    private makeCard() {
        const newCard = new ReRollCard("ReRollCard", this);
        this.hand.addCard(newCard);
    }

    private rollDice() {
        this.sumText.text = "Rolling...";
        this.dice.forEach(die => die?.roll());
    }

    private updateDiceSum = () => {
        const total = this.dice.reduce((sum, die) => sum + die.getTopValue(), 0);
        if (!this.sumText.text.includes("Rolling")) {
            this.sumText.text = "Sum: " + total;
        }
    }

    private setupObservables() {
        this.onKeyboardObservable.add((kbInfo) => {
            if (kbInfo.type === KeyboardEventTypes.KEYDOWN) {
                switch (kbInfo.event.code) {
                    case "Space": this.rollDice(); break;
                    case "KeyA": this.createDie(); break;
                    case "KeyS": this.makeCard(); break;
                }
            }
        });

        this.onPointerObservable.add((pointerInfo) => {
            switch (pointerInfo.type) {
                case PointerEventTypes.POINTERDOWN: this.hand.OnPointerDown(); break;
                case PointerEventTypes.POINTERUP: this.hand.OnPointerUp(); break;
                case PointerEventTypes.POINTERMOVE: this.hand.PointerMove(); break;
            }
        });

        this.onBeforeRenderObservable.add(this.updateDiceSum);
        this.onBeforeRenderObservable.add(this.hand.OnUpdate);
    }
}
