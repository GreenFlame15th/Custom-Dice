import { Mesh, Scene, MeshBuilder, StandardMaterial, Texture, Vector3, Animation, QuadraticEase, EasingFunction, Color3, VertexData, Quaternion, CreatePlaneVertexData } from "@babylonjs/core";
import { PlayerHand } from "./playerHand";
import { DieChallenge } from "./dieChallenge";
import { DieChallengeObject } from "./dieChellangeObject";
import { CardHighlight } from "./cardHighlight";

export abstract class Card extends DieChallengeObject {
    public originalPosition: Vector3 = Vector3.Zero();
    public originalRotation: Vector3 = Vector3.Zero();
    public isDragged: boolean = false;
    public cardHighlight: CardHighlight | null = null;

    constructor(name: string, scene: Scene) {
        super(name, scene);

        const vertexData = CreatePlaneVertexData({ width: 1, height: 1.4 });
        vertexData.applyToMesh(this);

        const mat = new StandardMaterial("mat_" + name, scene);
        mat.backFaceCulling = false;

        mat.emissiveColor = new Color3(1, 1, 1);
        mat.diffuseColor = new Color3(1, 1, 1);
        mat.specularColor = new Color3(0, 0, 0);

        this.material = mat;
    }

    public animateTo(position: Vector3, rotation: Vector3) {
        const frameRate = 30;
        Animation.CreateAndStartAnimation(
            "cardMove", this, "position", frameRate, 1,
            this.position, position, Animation.ANIMATIONLOOPMODE_CONSTANT
        );
        Animation.CreateAndStartAnimation(
            "cardRot", this, "rotation", frameRate, 1,
            this.rotation, rotation, Animation.ANIMATIONLOOPMODE_CONSTANT
        );
    }

    public animateToOrgin() { this.animateTo(this.originalPosition, this.originalRotation) }

    public setOrgin() {
        this.originalPosition = this.getAbsolutePosition().clone();
        this.originalRotation = this.absoluteRotationQuaternion.toEulerAngles().clone();
    }

    public abstract onPlay(hand: PlayerHand) : boolean;

    public removed(hand:PlayerHand)
    {
        hand.removeCard(this);
        this.dispose();
    }

    public abstract onDrag(hand: PlayerHand) : void;
    public abstract onStartDrag(hand: PlayerHand) : void;
    public abstract onEndDrag(hand: PlayerHand) : void;
}