import { Card } from "../card";
import { PlayerHand } from "../playerHand";
import { CardHighlight } from "../cardHighlight";
import { Color3, Scene } from "@babylonjs/core";
import { playableCard } from "../playableCard";

export class ResetCard extends playableCard {
  constructor(name: string, scene: Scene) {
    super(name, scene, "Reset", "Resets the game", new Color3(1, 0, 0));
    this.cardHighlight = new CardHighlight(12, 12, new Color3(1, 0, 0));
  }

  public onDrag(hand: PlayerHand): void {}

  public onPlay(hand: PlayerHand): boolean {
    const dieChallenge = this.getDieChallenge();
    if (!dieChallenge) {
      return false;
    }

    dieChallenge.dieManager.resetAllDice();
    dieChallenge.dieManager.setScore(0);
    dieChallenge.hand.reSet();

    return true;
  }

  public onEndDrag(hand: PlayerHand): void {}
  public onStartDrag(hand: PlayerHand): void {}
}
