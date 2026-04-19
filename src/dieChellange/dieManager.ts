import { AdvancedDynamicTexture, Control, Rectangle, TextBlock } from "@babylonjs/gui";
import { Die } from "./die";
import { Color3, Scene } from "@babylonjs/core";

export class DieManager {
    public dice: Die[] = [];
    private sumText!: TextBlock;

    public setUpDice(scene : Scene)
    {
        this.dice.push(new Die(scene, [1,1,1,1,10,10], Color3.Red(), Color3.Black()))
        this.dice.push(new Die(scene, [3,4,5,5,6,7], Color3.White(), Color3.Black()))
        this.dice.push(new Die(scene, [3,4,5,5,6,7], Color3.White(), Color3.Black()))
        this.dice.push(new Die(scene, [3,4,5,5,6,7], Color3.White(), Color3.Black()))
        this.dice.push(new Die(scene, [0,0,0,0,1,1], Color3.Black(), Color3.White()))
        this.dice.push(new Die(scene, [0,0,0,0,1,1], Color3.Black(), Color3.White()))
        this.dice.push(new Die(scene, [0,0,0,0,1,1], Color3.Black(), Color3.White()))
        this.dice.push(new Die(scene, [2,2,4,4,8,8], new Color3(1, 0.5, 0), Color3.White()))
        this.dice.push(new Die(scene, [2,2,4,4,8,8], new Color3(1, 0.5, 0), Color3.White()))
    }

    public updateDiceSum = () => {

        if (this.dice.some((die) => !die.isStill())) {
            this.sumText.text = "Rolling...";
            return;
        }

        const total = this.dice.reduce((sum, die) => sum + die.getTopValue(), 0);
        this.sumText.text = "Sum: " + total;
    }

    public constructor() {
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
}