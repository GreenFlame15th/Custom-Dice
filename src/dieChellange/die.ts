import {
  Mesh,
  Vector3,
  Scene,
  Vector4,
  CreateBoxVertexData,
  StandardMaterial,
  DynamicTexture,
  Color3,
  PhysicsAggregate,
  PhysicsShapeType,
  MeshBuilder,
  Engine,
  Quaternion,
} from "@babylonjs/core";
import { DieChallengeObject } from "./dieChellangeObject";

export class Die extends DieChallengeObject {
  public faceValues: number[];
  public physicsAggregate: PhysicsAggregate;
  private hilightMesh: Mesh;
  private static _sharedHighlightMat: StandardMaterial;

  private static readonly faceNormals = [
    new Vector3(0, 0, 1), // 0: Back
    new Vector3(0, 0, -1), // 1: Front
    new Vector3(1, 0, 0), // 2: Right
    new Vector3(-1, 0, 0), // 3: Left
    new Vector3(0, 1, 0), // 4: Top
    new Vector3(0, -1, 0), // 5: Bottom
  ];

  public constructor(
    scene: Scene,
    faceValues: number[],
    dieColor: Color3[] | Color3,
    textColor: Color3,
  ) {
    super("die", scene);
    this.faceValues = faceValues;

    const faceUV = Array.from(
      { length: 6 },
      (_, i) =>
        new Vector4(
          (i % 3) / 3,
          Math.floor(i / 3) / 2,
          ((i % 3) + 1) / 3,
          (Math.floor(i / 3) + 1) / 2,
        ),
    );
    CreateBoxVertexData({ size: 0.6, faceUV }).applyToMesh(this);

    this.hilightMesh = MeshBuilder.CreateBox(
      `${this.name}_Hilight`,
      { size: 0.6 },
      scene,
    );
    this.hilightMesh.setParent(this);
    this.hilightMesh.material = Die.getHighlightMaterial(scene);
    this.hilightMesh.renderingGroupId = 1;
    this.hilightMesh.isPickable = false;
    this.hilightMesh.setEnabled(false);

    const material = new StandardMaterial(`dieMat_${this.uniqueId}`, scene);
    const texture = new DynamicTexture(
      "dieTex",
      { width: 768, height: 512 },
      scene,
      false,
    );
    this.drawDiceFaces(texture, dieColor, textColor);

    material.diffuseTexture = texture;
    material.emissiveColor = new Color3(0.2, 0.2, 0.2);
    material.specularColor = new Color3(0.5, 0.5, 0.5);
    material.backFaceCulling = true;
    this.material = material;

    this.physicsAggregate = new PhysicsAggregate(
      this,
      PhysicsShapeType.BOX,
      { mass: 1, restitution: 0.5, friction: 0.5 },
      scene,
    );
    this.physicsAggregate.body.setLinearDamping(0.3);
    this.physicsAggregate.body.setAngularDamping(0.3);
    this.reSet();
  }

  public reSet() {
    const body = this.physicsAggregate.body;
    if (this.material) this.material.alpha = 0

    body.setLinearVelocity(Vector3.Zero());
    body.setAngularVelocity(Vector3.Zero());

    body.disablePreStep = false;

    this.position.setAll(0);
    this.rotationQuaternion = Quaternion.Identity();

    this.getScene().onAfterPhysicsObservable.addOnce(() => {
      body.disablePreStep = true;

      body.setLinearVelocity(new Vector3(Die.randomHalf(), 0.25, Die.randomHalf())
        .normalize()
        .scale(8));
      body.setAngularVelocity(new Vector3(Die.randomHalf(), Die.randomHalf(), Die.randomHalf())
        .normalize()
        .scale(15),);


      if (this.material) this.material.alpha = 1
    });
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

  private readonly underlineWidth: number = 80;
  private readonly underlineHeight: number = 20;
  private drawDiceFaces(
    tex: DynamicTexture,
    dieColor: Color3[] | Color3,
    textColor: Color3,
  ) {
    const ctx = tex.getContext() as CanvasRenderingContext2D;
    const isArray = Array.isArray(dieColor);

    this.faceValues.forEach((val, i) => {
      const x = (i % 3) * 256;
      const y = (1 - Math.floor(i / 3)) * 256;

      ctx.fillStyle = (
        isArray ? dieColor[i % dieColor.length] : dieColor
      ).toHexString();
      ctx.fillRect(x, y, 256, 256);

      ctx.fillStyle = textColor.toHexString();
      ctx.font = "150px Impact";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(val.toString(), x + 128, y + 128);

      if (val === 6 || val === 9) {
        ctx.fillRect(
          x + 128 - this.underlineWidth / 2,
          y + 128 + 60,
          this.underlineWidth,
          this.underlineHeight,
        );
      }
    });
    tex.update();
  }

  public setGlow(color: Color3) {
    const hl = this.getDieChallenge()?.highlightLayer;
    if (!hl) return;

    hl.removeMesh(this.hilightMesh);
    hl.addMesh(this.hilightMesh, color);
    this.hilightMesh.setEnabled(true);
  }

  public removeGlow() {
    const hl = this.getDieChallenge()?.highlightLayer;
    if (!hl) return;

    this.hilightMesh.setEnabled(false);
  }

  private static readonly epsilon: number = 1;
  public isStill(): boolean {
    const body = this.physicsAggregate.body;
    const linVel = body.getLinearVelocity();
    const angVel = body.getAngularVelocity();
    return (
      linVel.lengthSquared() < Die.epsilon &&
      angVel.lengthSquared() < Die.epsilon
    );
  }

  public getTopValue(): number {
    let maxDot = -Infinity;
    let topIndex = 0;
    Die.faceNormals.forEach((normal, index) => {
      const worldNormal = Vector3.TransformNormal(
        normal,
        this.getWorldMatrix(),
      );
      const dot = Vector3.Dot(worldNormal, Vector3.UpReadOnly);
      if (dot > maxDot) {
        maxDot = dot;
        topIndex = index;
      }
    });
    return this.faceValues[topIndex];
  }

  public roll() {
    this.physicsBody?.applyImpulse(
      new Vector3(Die.randomHalf(), 1, Die.randomHalf()).normalize().scale(12),
      this.absolutePosition,
    );
    this.physicsBody?.setAngularVelocity(
      new Vector3(Die.randomHalf(), Die.randomHalf(), Die.randomHalf())
        .normalize()
        .scale(15),
    );
  }

  public burst(origin: Vector3) {
    let dir = this.getAbsolutePosition().subtract(origin).normalize();
    dir.y = 2.5;
    this.physicsBody?.applyImpulse(
      dir.normalize().scale(12),
      this.absolutePosition,
    );
    this.physicsBody?.setAngularVelocity(
      new Vector3(Die.randomHalf(), Die.randomHalf(), Die.randomHalf())
        .normalize()
        .scale(15),
    );
  }

  private static randomHalf = () => Math.random() - 0.5;

  public dispose(
    doNotRecurse?: boolean,
    disposeMaterialAndTextures?: boolean,
  ): void {
    this.material?.dispose(true, true);
    super.dispose(doNotRecurse, disposeMaterialAndTextures);
  }
}
