import { Card } from "./card";
import { PlayerHand } from "./playerHand";
import { CardHighlight } from "./cardHighlight";
import { Scene } from "@babylonjs/core";

export class ReRollCard extends Card {

    constructor(name: string, scene: Scene)
    {
        super(name, scene)
        this.cardHighlight = new CardHighlight(1.7, 1.6);

    }

    public onDrag(hand: PlayerHand): void {

    }

    public onPlay(hand: PlayerHand): boolean {
        const challenge = this.getDieChallenge();
        if(!challenge) {return false;}

        const affected = this.cardHighlight?.getSplit(this).affected ?? [];
        
        if (affected.length === 0) return false;

        const burstOrigin = this.getAbsolutePosition().clone();
        burstOrigin.y = challenge?.spiritBox.floor.getAbsolutePosition().y ?? 0;

        affected.forEach(die => die.burst(burstOrigin));
        return true;
    }

    public onEndDrag(hand: PlayerHand): void {}
    public onStartDrag(hand: PlayerHand): void {}
}
