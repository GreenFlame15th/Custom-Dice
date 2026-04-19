import { Mesh, Vector3, Scene, Vector4, CreateBoxVertexData, StandardMaterial, DynamicTexture, Color3, PhysicsAggregate, PhysicsShapeType, MeshBuilder, Engine } from '@babylonjs/core';
import { DieChallengeObject } from './dieChellangeObject';

export class Die extends DieChallengeObject {
    public faceValues: number[];
    public physicsAggregate: PhysicsAggregate;
    private hilightMesh: Mesh;
    private static _sharedHighlightMat: StandardMaterial;

    private static readonly faceNormals = [
    new Vector3(0, 0, 1),  // 0: Back
    new Vector3(0, 0, -1), // 1: Front
    new Vector3(1, 0, 0),  // 2: Right
    new Vector3(-1, 0, 0), // 3: Left
    new Vector3(0, 1, 0),  // 4: Top
    new Vector3(0, -1, 0)  // 5: Bottom
];

    public constructor(scene: Scene, faceValues: number[]) {
        super("die", scene);
        this.faceValues = faceValues;

        const faceUV = Array.from({ length: 6 }, (_, i) => 
            new Vector4((i % 3) / 3, Math.floor(i / 3) / 2, (i % 3 + 1) / 3, (Math.floor(i / 3) + 1) / 2)
        );
        CreateBoxVertexData({ size: 0.6, faceUV }).applyToMesh(this);

        this.hilightMesh = MeshBuilder.CreateBox(`${this.name}_Hilight`, { size: 0.6 }, scene);
        this.hilightMesh.setParent(this);
        this.hilightMesh.material = Die.getHighlightMaterial(scene);
        this.hilightMesh.renderingGroupId = 1;
        this.hilightMesh.isPickable = false;
        this.hilightMesh.setEnabled(false);

        const mat = new StandardMaterial(`dieMat_${this.uniqueId}`, scene);
        const tex = new DynamicTexture("dieTex", { width: 768, height: 512 }, scene, false);
        this.drawDiceFaces(tex);
        
        mat.diffuseTexture = tex;
        mat.emissiveColor = new Color3(0.2, 0.2, 0.2);
        mat.specularColor = new Color3(0.5, 0.5, 0.5);
        mat.backFaceCulling = true;
        this.material = mat;

        this.physicsAggregate = new PhysicsAggregate(this, PhysicsShapeType.BOX, { mass: 1, restitution: 0.5, friction: 0.5 }, scene);
        this.physicsAggregate.body.setLinearDamping(0.3);
        this.physicsAggregate.body.setAngularDamping(0.3);

        this.position = new Vector3(Die.randomHalf(), 2, Die.randomHalf());
        this.roll();
    }

    private static getHighlightMaterial(scene: Scene): StandardMaterial {
        if (!this._sharedHighlightMat) {
            const mat = new StandardMaterial("sharedHighlightMat", scene);
            mat.emissiveColor = Color3.White();
            mat.alpha = 0;
            this._sharedHighlightMat = mat;
        }
        return this._sharedHighlightMat;
    }

    private drawDiceFaces(tex: DynamicTexture) {
        const ctx = tex.getContext() as CanvasRenderingContext2D;;
        const colors = ["#FF5733", "#33FF57", "#3357FF", "#F333FF", "#FFF333", "#33FFF3"];
        this.faceValues.forEach((val, i) => {
            const x = (i % 3) * 256;
            const y = (1 - Math.floor(i / 3)) * 256;
            ctx.fillStyle = colors[i % colors.length];
            ctx.fillRect(x, y, 256, 256);
            ctx.fillStyle = "black";
            ctx.font = "150px Impact";
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";
            ctx.fillText(val.toString(), x + 128, y + 128);
        });
        tex.update();
    }

    public setGlow(color: Color3 = Color3.White()) {
        const hl = this.getDieChallenge()?.highlightLayer;
        if (!hl) return;

        hl.removeMesh(this.hilightMesh);
        hl.addMesh(this.hilightMesh, color);
        this.hilightMesh.setEnabled(true);
    }

    public removeGlow()
    {
        const hl = this.getDieChallenge()?.highlightLayer;
        if (!hl) return;

        hl.removeMesh(this.hilightMesh);
        this.hilightMesh.setEnabled(false);
    }

    private static readonly epsilon: number = 1;
    public isStill(): boolean {
    const body = this.physicsAggregate.body;
    const linVel = body.getLinearVelocity();
    const angVel = body.getAngularVelocity();
    return linVel.lengthSquared() < Die.epsilon && angVel.lengthSquared() < Die.epsilon;
}

    public getTopValue(): number {
        let maxDot = -Infinity;
        let topIndex = 0;
        Die.faceNormals.forEach((normal, index) => {
            const worldNormal = Vector3.TransformNormal(normal, this.getWorldMatrix());
            const dot = Vector3.Dot(worldNormal, Vector3.UpReadOnly);
            if (dot > maxDot) { maxDot = dot; topIndex = index; }
        });
        return this.faceValues[topIndex];
    }

    public roll() {
        this.physicsBody?.applyImpulse(new Vector3(Die.randomHalf(), 1, Die.randomHalf()).normalize().scale(12), this.absolutePosition);
        this.physicsBody?.setAngularVelocity(new Vector3(Die.randomHalf(), Die.randomHalf(), Die.randomHalf()).normalize().scale(15));
    }

    public burst(origin: Vector3) {
        let dir = this.getAbsolutePosition().subtract(origin).normalize();
        dir.y = 2.5;
        this.physicsBody?.applyImpulse(dir.normalize().scale(12), this.absolutePosition);
        this.physicsBody?.setAngularVelocity(new Vector3(Die.randomHalf(), Die.randomHalf(), Die.randomHalf()).normalize().scale(15));
    }

    private static randomHalf = () => Math.random() - 0.5;

    public dispose(doNotRecurse?: boolean, disposeMaterialAndTextures?: boolean): void {
        this.material?.dispose(true, true);
        super.dispose(doNotRecurse, disposeMaterialAndTextures);
    }
}
