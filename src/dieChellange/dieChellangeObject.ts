import { Mesh, Scene, Nullable } from "@babylonjs/core";
import { DieChallenge } from "./dieChallenge";

export class DieChallengeObject extends Mesh {

    public getDieChallenge(): DieChallenge | null {
        const scene = this.getScene();
    
        if (scene instanceof DieChallenge) {
            return scene;
        }

        console.error("Mesh is not attached to a DieChallenge scene.");
        return null;
    }
}
