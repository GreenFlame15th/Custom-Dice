import { AdvancedDynamicTexture, Control, Rectangle, TextBlock } from "@babylonjs/gui";
import { Die } from "./die";

export class DieManager {
    public dice: Die[] = [];
    private sumText!: TextBlock;

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