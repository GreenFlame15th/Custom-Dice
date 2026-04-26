import { Card } from "../card";
import { PlayerHand } from "../playerHand";
import { CardHighlight } from "../cardHighlight";
import { Color3, Scene } from "@babylonjs/core";
import { playableCard } from "../playableCard";

export class ReRollCard extends playableCard {
  constructor(name: string, scene: Scene) {
    super(
      name,
      scene,
      "Re-roll",
      "Rerolls all dice in an area",
      new Color3(0.094, 0.678, 0.69),
    );
    this.cardHighlight = new CardHighlight(
      1.7,
      1.6,
      new Color3(0.094, 0.678, 0.69),
    );
  }

  public onDrag(hand: PlayerHand): void {}

  public onPlay(hand: PlayerHand): boolean {
    const challenge = this.getDieChallenge();
    if (!challenge) {
      return false;
    }

    const affected = this.cardHighlight?.getSplit(this).affected ?? [];

    if (affected.length === 0) return false;

    const burstOrigin = this.getAbsolutePosition().clone();
    burstOrigin.y = challenge?.spiritBox.floor.getAbsolutePosition().y ?? 0;

    affected.forEach((die) => die.burst(burstOrigin));
    return true;
  }

  public onEndDrag(hand: PlayerHand): void {}
  public onStartDrag(hand: PlayerHand): void {}
}
