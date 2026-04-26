import { Card } from "./card";
import { PlayerHand } from "./playerHand";

export abstract class playableCard extends Card
{
        public abstract onPlay(hand: PlayerHand): boolean;

    public remove(hand: PlayerHand) {
        hand.removeCard(this);
        this.dispose();
    }

    public abstract onDrag(hand: PlayerHand): void;
    public abstract onStartDrag(hand: PlayerHand): void;
    public abstract onEndDrag(hand: PlayerHand): void;
}