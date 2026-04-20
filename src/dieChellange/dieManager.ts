import {
  AdvancedDynamicTexture,
  Control,
  Rectangle,
  StackPanel,
  TextBlock,
} from "@babylonjs/gui";
import { Die } from "./die";
import { Color3, PhysicsMotionType, Scene } from "@babylonjs/core";

export class DieManager {
  public dice: Die[] = [];
  private score: number = 0;
  private bestScore: number = 0;
  private sumText!: TextBlock;
  private scoreText!: TextBlock;
  private bestScoreText!: TextBlock;

  public setScore(score: number) {
    this.score = score;
    this.scoreText.text = "Score: " + score;
  }

  public setBestScore(score: number) {
    this.bestScore = score;
    this.bestScoreText.text = "Best score: " + score;
  }

  public setUpDice(scene: Scene) {
    this.dice.push(
      new Die(scene, [1, 1, 1, 1, 10, 10], Color3.Red(), Color3.Black()),
    );
    this.dice.push(
      new Die(scene, [3, 4, 5, 5, 6, 7], Color3.White(), Color3.Black()),
    );
    this.dice.push(
      new Die(scene, [3, 4, 5, 5, 6, 7], Color3.White(), Color3.Black()),
    );
    this.dice.push(
      new Die(scene, [3, 4, 5, 5, 6, 7], Color3.White(), Color3.Black()),
    );
    this.dice.push(
      new Die(scene, [0, 0, 0, 0, 1, 1], Color3.Black(), Color3.White()),
    );
    this.dice.push(
      new Die(scene, [0, 0, 0, 0, 1, 1], Color3.Black(), Color3.White()),
    );
    this.dice.push(
      new Die(scene, [0, 0, 0, 0, 1, 1], Color3.Black(), Color3.White()),
    );
    this.dice.push(
      new Die(scene, [2, 2, 4, 4, 8, 8], new Color3(1, 0.5, 0), Color3.White()),
    );
    this.dice.push(
      new Die(scene, [2, 2, 4, 4, 8, 8], new Color3(1, 0.5, 0), Color3.White()),
    );

    this.resetAllDice();
  }

  public resetAllDice() {
    this.dice.forEach((die) => {
      die.setEnabled(false);
      die.physicsAggregate.body.setMotionType(PhysicsMotionType.STATIC);
    });
    this.runResetSequence();
  }


  private async runResetSequence() {
    const delay = (ms: number) => new Promise((res) => setTimeout(res, ms));

    await delay(1);

    for (const die of this.dice) {
      die.setEnabled(true);
      die.physicsAggregate.body.setMotionType(PhysicsMotionType.DYNAMIC);
      await delay(1);
      die.reSet();
      await delay(100);
    }
  }

  public updateDiceSum = () => {
    if (this.Rolling()) {
      this.sumText.text = "Rolling...";
      return;
    }

    const total = this.getSum();
    this.sumText.text = "Sum: " + total;
  };

  public Rolling() {
    return this.dice.some((die) => !die.isStill());
  }

  public Score(): boolean {
    if (this.Rolling()) return false;
    this.score += this.getSum();
    this.scoreText.text = "Score: " + this.score;

    if (this.score > this.bestScore) {
      this.bestScore = this.score;
      this.bestScoreText.text = "Best score: " + this.bestScore;
      localStorage.setItem(
        "GF:Custom_dice:bestscore",
        this.bestScore.toString(),
      );
    }

    this.dice.forEach((die) => die.roll());

    return true;
  }

  public getSum(): number {
    return this.dice.reduce((sum, die) => sum + die.getTopValue(), 0);
  }

  public constructor() {
    const advancedTexture = AdvancedDynamicTexture.CreateFullscreenUI("UI");

    const panel = new Rectangle();
    panel.width = "250px";
    panel.height = "120px";
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
    this.setScore(0);
    this.scoreText.color = "#00ff00";
    this.scoreText.fontFamily = "Arial";
    this.scoreText.fontSize = 24;
    this.scoreText.height = "35px";
    stackPanel.addControl(this.scoreText);

    this.bestScoreText = new TextBlock();
    this.setBestScore(
      Number.parseInt(localStorage.getItem("GF:Custom_dice:bestscore") ?? "0"),
    );
    this.bestScoreText.color = "red";
    this.bestScoreText.fontFamily = "Arial";
    this.bestScoreText.fontSize = 24;
    this.bestScoreText.height = "35px";
    stackPanel.addControl(this.bestScoreText);
  }
}
