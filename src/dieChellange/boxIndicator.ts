import { MeshBuilder, StandardMaterial, Color3, Scene, Constants, Vector3, Mesh, VertexData, CreateDiscVertexData } from "@babylonjs/core";
import { DieChallengeObject } from "./dieChellangeObject";

export class BoxIndicator extends DieChallengeObject {
    
    constructor(scene: Scene, private parentMesh: Mesh) {
        super("Highlight", scene);
        
        const vertexData = CreateDiscVertexData({ radius: 1 });
        vertexData.applyToMesh(this);

        const engine = scene.getEngine();

        this.parent = parentMesh;
        this.position.y = 0;
        this.isVisible = false;
        this.alphaIndex = 999;

        const mat = new StandardMaterial("HighlightMat", scene);
        mat.diffuseColor = new Color3(0.4, 0.7, 1);
        mat.emissiveColor = new Color3(0, 0.15, 0.3);
        mat.alpha = 0.2;
        this.material = mat;

        this.onBeforeRenderObservable.add(() => {
            engine.setStencilFunction(Constants.EQUAL);
            engine.setStencilFunctionReference(1);
        });

        this.onAfterRenderObservable.add(() => {
            engine.setStencilFunction(Constants.ALWAYS);
        });
    }

    public setRadius(size: number) {
        this.scaling.set(size, size, size);
    }

    public update(worldPoint: Vector3, size: number) {
        this.isVisible = true;
        this.scaling.setAll(size);
        const newPosition = worldPoint.clone();
        newPosition.y = (this.parentMesh ?? this).getAbsolutePosition().y;
        this.setAbsolutePosition(newPosition);
    }

    public hide() {
        this.isVisible = false;
    }
}
