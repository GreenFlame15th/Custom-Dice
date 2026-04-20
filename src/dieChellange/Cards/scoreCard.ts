import { Card } from "../card";
import { PlayerHand } from "../playerHand";
import { CardHighlight } from "../cardHighlight";
import { Color3, Scene } from "@babylonjs/core";
import { playableCard } from "../playableCard";

export class ScoreCard extends playableCard {
  constructor(name: string, scene: Scene) {
    super(
      name,
      scene,
      "Score",
      "Score all dice (not playable when dice are in motsion)",
      new Color3(0, 0.761, 0),
    );
    this.cardHighlight = new CardHighlight(12, 12, new Color3(0, 1, 0));
  }

  public onDrag(hand: PlayerHand): void {}

  public onPlay(hand: PlayerHand): boolean {
    const dieManager = this.getDieChallenge()?.dieManager;
    if (!dieManager) {
      return false;
    }

    return dieManager.Score();
  }

  public onEndDrag(hand: PlayerHand): void {}
  public onStartDrag(hand: PlayerHand): void {}
}
