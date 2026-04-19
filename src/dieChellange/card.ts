import { Mesh, Scene, MeshBuilder, StandardMaterial, Texture, Vector3, Animation, Color3, CreatePlaneVertexData, DynamicTexture, ICanvasRenderingContext } from "@babylonjs/core";
import { PlayerHand } from "./playerHand";
import { DieChallengeObject } from "./dieChellangeObject";
import { CardHighlight } from "./cardHighlight";

export class Card extends DieChallengeObject {
    public originalPosition: Vector3 = Vector3.Zero();
    public originalRotation: Vector3 = Vector3.Zero();
    public isDragged: boolean = false;
    public cardHighlight: CardHighlight | null = null;
    private myMaterial: StandardMaterial;
    private width: number = 512;
    private height: number = 716;
    private padding: number = 100;

    constructor(name: string, scene: Scene, title: string, description: string, private color: Color3) {
        super(name, scene);

        const vertexData = CreatePlaneVertexData({ width: 1, height: 1.4 });
        vertexData.applyToMesh(this);

        const dynamicTexture = new DynamicTexture("cardTexture_" + name, { width: this.width, height: this.height  }, scene);

        const mat = new StandardMaterial("mat_" + name, scene);
        mat.diffuseTexture = dynamicTexture;
        mat.backFaceCulling = false;
        this.material = mat;
        this.myMaterial = mat;
        this.setInHand(true);

        this.drawCardUI(dynamicTexture, title, description);
    }

    public setInHand(inHand: boolean) {
        if (inHand) {
            this.myMaterial.emissiveColor = Color3.White();
            this.renderingGroupId = 1;
        } else {
            this.myMaterial.emissiveColor = Color3.Black();
            this.renderingGroupId = 0;
        }
    }

    private drawCardUI(texture: DynamicTexture, title: string, description: string) {
        const ctx = texture.getContext() as CanvasRenderingContext2D;

        ctx.clearRect(0, 0, this.width, this.height);
        ctx.fillStyle = this.color.toHexString();
        ctx.fillRect(0, 0, this.width, this.height);

        const borderThickness = 10; 
        ctx.strokeStyle = "black";
        ctx.lineWidth = borderThickness;
        ctx.strokeRect(borderThickness / 2, borderThickness / 2, this.width - borderThickness, this.height - borderThickness);
        
        texture.drawText(title, null, 150, "bold 88px Arial", "White", "transparent", true);
        
        const fontSize = 38;
        const lineHeight = 44;
        ctx.font = `${fontSize}px Arial`;
        ctx.fillStyle = "#e2e2e2";
        
        ctx.textAlign = "center";  

        const centerX = this.width / 2;
        this.wrapText(ctx, description, centerX, 350, this.width - (this.padding * 2), lineHeight);

        texture.update();
    }

    private wrapText(ctx: CanvasRenderingContext2D, text: string, x: number, y: number, maxWidth: number, lineHeight: number) {
        const words = text.split(' ');
        let line = '';
        let currentY = y;

        for (let n = 0; n < words.length; n++) {
            const testLine = line + words[n] + ' ';
            const metrics = ctx.measureText(testLine);
            const testWidth = metrics.width;

            if (testWidth > maxWidth && n > 0) {
                ctx.fillText(line.trim(), x, currentY);
                line = words[n] + ' ';
                currentY += lineHeight;
            } else {
                line = testLine;
            }
        }
        ctx.fillText(line.trim(), x, currentY);
    }

    public animateTo(position: Vector3, rotation: Vector3) {
        const frameRate = 30;
        Animation.CreateAndStartAnimation("cardMove", this, "position", frameRate, 1, this.position, position, Animation.ANIMATIONLOOPMODE_CONSTANT);
        Animation.CreateAndStartAnimation("cardRot", this, "rotation", frameRate, 1, this.rotation, rotation, Animation.ANIMATIONLOOPMODE_CONSTANT);
    }

    public animateToOrgin() { this.animateTo(this.originalPosition, this.originalRotation) }

    public setOrgin() {
        this.originalPosition = this.getAbsolutePosition().clone();
        this.originalRotation = this.absoluteRotationQuaternion.toEulerAngles().clone();
    }
}
