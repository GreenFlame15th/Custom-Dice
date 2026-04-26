import {
  Color3,
  Constants,
  CreateDiscVertexData,
  Mesh,
  Scene,
  StandardMaterial,
  Vector3
} from "@babylonjs/core";
import { DieChallengeObject } from "./dieChellangeObject";

export class BoxIndicator extends DieChallengeObject {
  constructor(
    scene: Scene,
    private parentMesh: Mesh,
  ) {
    super("Highlight", scene);

    const vertexData = CreateDiscVertexData({ radius: 1 });
    vertexData.applyToMesh(this);

    const engine = scene.getEngine();

    this.parent = parentMesh;
    this.position.y = 0;
    this.isVisible = false;
    this.alphaIndex = 999;

    const mat = new StandardMaterial("HighlightMat", scene);
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

  public update(worldPoint: Vector3, size: number, color: Color3) {
    this.isVisible = true;
    this.scaling.setAll(size);
    const newPosition = worldPoint.clone();
    newPosition.y = (this.parentMesh ?? this).getAbsolutePosition().y;
    this.setAbsolutePosition(newPosition);
    if (this.material && this.material instanceof StandardMaterial) {
      this.material.diffuseColor = color;
      this.material.emissiveColor = color;
    }
  }

  public hide() {
    this.isVisible = false;
  }
}
