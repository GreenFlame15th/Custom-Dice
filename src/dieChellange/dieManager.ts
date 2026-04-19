import { AdvancedDynamicTexture, Control, Rectangle, StackPanel, TextBlock } from "@babylonjs/gui";
import { Die } from "./die";
import { Color3, Scene } from "@babylonjs/core";

export class DieManager {
    public dice: Die[] = [];
    private sumText!: TextBlock;  
    private scoreText!: TextBlock;
    private bestScoreText!: TextBlock;

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
        panel.width = "250px";
        panel.height = "120px"; // Increased height for 3 lines
        panel.cornerRadius = 10;
        panel.color = "white";
        panel.background = "rgba(0,0,0,0.6)";
        panel.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_RIGHT;
        panel.verticalAlignment = Control.VERTICAL_ALIGNMENT_TOP;
        panel.top = "20px";
        panel.left = "-20px";
        advancedTexture.addControl(panel);

        const stackPanel = new StackPanel();
        panel.addControl(stackPanel);

        this.sumText = new TextBlock();
        this.sumText.text = "Sum: 0";
        this.sumText.color = "yellow";
        this.sumText.fontFamily = "Arial";
        this.sumText.fontSize = 24;
        this.sumText.height = "35px";
        stackPanel.addControl(this.sumText);

        this.scoreText = new TextBlock();
        this.scoreText.text = "Score: 0";
        this.scoreText.color = "#00ff00";
        this.scoreText.fontFamily = "Arial";
        this.scoreText.fontSize = 24;
        this.scoreText.height = "35px";
        stackPanel.addControl(this.scoreText);

        this.bestScoreText = new TextBlock();
        this.bestScoreText.text = "Best score: 0";
        this.bestScoreText.color = "red";
        this.bestScoreText.fontFamily = "Arial";
        this.bestScoreText.fontSize = 24;
        this.bestScoreText.height = "35px";
        stackPanel.addControl(this.bestScoreText);
    }
}