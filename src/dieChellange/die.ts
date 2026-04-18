import { Mesh, Vector3, Scene, Vector4, CreateBoxVertexData, StandardMaterial, DynamicTexture, Color3, PhysicsAggregate, PhysicsShapeType, MeshBuilder, Engine } from '@babylonjs/core';
import { DieChallengeObject } from './dieChellangeObject';

export class Die extends DieChallengeObject {
    public faceValues: number[];
    public physicsAggregate: PhysicsAggregate;
    private static readonly faceNormals = [
        new Vector3(0, 0, 1),  // Front (Face 0)
        new Vector3(1, 0, 0),  // Right (Face 2)
        new Vector3(0, -1, 0),  // Bottom (Face 5)
        new Vector3(0, 0, -1), // Back (Face 1)
        new Vector3(-1, 0, 0), // Left (Face 3)
        new Vector3(0, 1, 0)  // Top (Face 4)
    ];
    private hilightMesh: Mesh;

    public constructor(scene: Scene, faceValues: number[]) {
        super("die", scene);
        this.faceValues = faceValues;

        const faceUV = new Array(6);
        for (let i = 0; i < 6; i++) {
            const col = i % 3;
            const row = Math.floor(i / 3);
            faceUV[i] = new Vector4(col / 3, row / 2, (col + 1) / 3, (row + 1) / 2);
        }


        const vertexData = CreateBoxVertexData({ size: 0.6, faceUV: faceUV });
        vertexData.applyToMesh(this);

        this.hilightMesh = MeshBuilder.CreateBox(this.name + "Hilight", { size: 0.65 }, scene); // Slightly larger
        this.hilightMesh.setParent(this);

        const highlightMat = new StandardMaterial("highlightMat", scene);
        highlightMat.emissiveColor = Color3.White();
        highlightMat.disableDepthWrite = true;
        highlightMat.alpha = 0; 
        this.hilightMesh.renderingGroupId = 1; 
        highlightMat.depthFunction = Engine.ALWAYS;

        this.hilightMesh.material = highlightMat;
        this.hilightMesh.isVisible = true;
        this.hilightMesh.isPickable = false;

        const mat = new StandardMaterial("dieMat_" + Math.random(), scene);
        const tex = new DynamicTexture("dieTex", { width: 768, height: 512 }, scene);
        const colors = ["#FF5733", "#33FF57", "#3357FF", "#F333FF", "#FFF333", "#33FFF3"];
        mat.emissiveColor = new Color3(0.2, 0.2, 0.2);
        mat.specularColor = new Color3(0.5, 0.5, 0.5);

        const ctx = tex.getContext() as CanvasRenderingContext2D;;
        this.faceValues.forEach((val, i) => {
            const col = i % 3;
            const row = 1 - Math.floor(i / 3);
            const x = col * 256;
            const y = row * 256;
            ctx.fillStyle = colors[i % colors.length];
            ctx.fillRect(x, y, 256, 256);
            ctx.fillStyle = "black";
            ctx.font = "150px Impact";
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";
            ctx.fillText(val.toString(), x + 128, y + 128);
        });

        tex.update();
        mat.diffuseTexture = tex;
        this.material = mat;

        this.position = new Vector3(Math.random() - 0.5, 2, Math.random() - 0.5);

        this.physicsAggregate = new PhysicsAggregate(
            this,
            PhysicsShapeType.BOX,
            {
                mass: 1,
                restitution: 0.5,
                friction: 0.5

            },
            scene
        );

        this.physicsAggregate.body.setLinearDamping(0.3);
        this.physicsAggregate.body.setAngularDamping(0.3);

        this.physicsBody?.applyImpulse(new Vector3(Die.randomHalf(), 0, Die.randomHalf()).normalize().scale(5), this.absolutePosition);
        this.applyRollSpin();
    }

    public setGlow(enabled: boolean, color: Color3 = Color3.White()) {
        const highlightLayer = this.getDieChallenge()?.highlightLayer;
        if (!highlightLayer) return;

        if (enabled) {
            highlightLayer.addMesh(this.hilightMesh, color);
        } else {
            highlightLayer.removeMesh(this.hilightMesh);
        }
    }

    public getTopValue(): number {
        let maxDot = -Infinity;
        let topIndex = 0;

        Die.faceNormals.forEach((normal, index) => {
            const worldNormal = Vector3.TransformNormal(normal, this.getWorldMatrix());
            const dot = Vector3.Dot(worldNormal, Vector3.UpReadOnly);
            if (dot > maxDot) {
                maxDot = dot;
                topIndex = index;
            }
        });

        return this.faceValues[topIndex];
    }

    private static readonly rollForce: number = 10;
    private static readonly rollSpin: number = 15;
    private static getRollSpin() {
        return new Vector3(Die.randomHalf(), Die.randomHalf(), Die.randomHalf()).normalize().scale(Die.rollSpin);
    }
    private applyRollSpin() {
        this.physicsBody?.setAngularVelocity(Die.getRollSpin());
    }

    public roll() {
        this.physicsBody?.applyImpulse(new Vector3(Die.randomHalf(), 1, Die.randomHalf()).normalize().scale(Die.rollForce), this.absolutePosition);
        this.applyRollSpin();
    };

    public burst(origin: Vector3) {
        let vectorToOrigin = this.getAbsolutePosition().subtract(origin);
        vectorToOrigin = vectorToOrigin.normalize();
        vectorToOrigin.y = 2.5;
        vectorToOrigin = vectorToOrigin.normalize();
        this.physicsBody?.applyImpulse(vectorToOrigin.scale(Die.rollForce), this.absolutePosition);
        this.applyRollSpin();
    }

    private static randomHalf() {
        return Math.random() - 0.5;
    }

    public dispose(doNotRecurse?: boolean, disposeMaterialAndTextures?: boolean): void {
        if (this.material) {
            this.material.dispose(true, true);
        }
        super.dispose(doNotRecurse, disposeMaterialAndTextures);
    }
}
