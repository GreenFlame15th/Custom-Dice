import { Mesh, PhysicsAggregate, Scene, CreateBoxVertexData, StandardMaterial, Color3, MeshBuilder, Constants, PhysicsShapeType, Vector3 } from "@babylonjs/core";
import { BoxIndicator } from "./boxIndicator";

export class SpiritBox extends Mesh {
    public aggregate!: PhysicsAggregate;
    public floor: Mesh;
    public static size: number = 6;
    public static halfSize = this.size/2

    constructor(scene: Scene) {
        super("SpiritBox", scene);

        const engine = scene.getEngine();
        engine.setStencilBuffer(true);

        const vertexData = CreateBoxVertexData({ size: SpiritBox.size, sideOrientation: Mesh.DOUBLESIDE });
        vertexData.applyToMesh(this);
        const mat = new StandardMaterial("BoxMat", scene);
        mat.alpha = 0.1;
        mat.emissiveColor = new Color3(0.2, 0.2, 0.4);
        this.material = mat;

        this.floor = MeshBuilder.CreatePlane("BoxFloor", { size: SpiritBox.size }, scene);
        this.floor.parent = this;
        this.floor.position.y = -SpiritBox.halfSize;
        this.floor.rotation.x = Math.PI / 2;
        this.floor.alphaIndex = 1000;

        const floorMat = new StandardMaterial("FloorMat", scene);
        floorMat.disableColorWrite = true;
        floorMat.disableDepthWrite = true;
        this.floor.material = floorMat;

        this.floor.onBeforeRenderObservable.add(() => {
            engine.setStencilFunction(Constants.ALWAYS);
            engine.setStencilMask(0xFF);
            engine.setStencilOperationPass(Constants.REPLACE);
            engine.setStencilFunctionReference(1);
        });

        this.aggregate = new PhysicsAggregate(this, PhysicsShapeType.MESH, { mass: 0 }, scene);
    }

    public isInBound(absolutePosition: Vector3): boolean {
        const center = this.getAbsolutePosition();

        return Math.abs(center.x - absolutePosition.x) <= SpiritBox.halfSize
            && Math.abs(center.y - absolutePosition.y) <= SpiritBox.halfSize
            && Math.abs(center.z - absolutePosition.z) <= SpiritBox.halfSize;
    }
}