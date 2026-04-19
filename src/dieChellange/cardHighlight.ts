import { Vector3 } from "@babylonjs/core";
import { Die } from "./die";
import { Card } from "./card";
import { BoxIndicator } from "./boxIndicator";

export class CardHighlight {
    private readonly highlightSizeSq: number;
    

    constructor(public highlightSize: number, public indicatorSize : number) {
        this.highlightSizeSq = highlightSize * highlightSize;
    }

    private getDiceInRange(origin: Vector3, dice: Die[]) {
        return dice.reduce((acc, die) => {
            const diePos = die.getAbsolutePosition();
            const distSq = Math.pow(diePos.x - origin.x, 2) + Math.pow(diePos.z - origin.z, 2);

            if (distSq < this.highlightSizeSq) {
                acc.affected.push(die);
            } else {
                acc.unaffected.push(die);
            }
            return acc;
        }, { affected: [] as Die[], unaffected: [] as Die[] });
    }

    public getSplit(card: Card): { affected: Die[], unaffected: Die[] } {
        const origin = card.getAbsolutePosition();
        const split = this.getDiceInRange(origin, card.getDieChallenge()?.dice ?? []);
        return split;
    }

    public static updateIndicator(card: Card | null, indicator: BoxIndicator ): void {

        const dieChallenge = indicator.getDieChallenge();
        const highlight = card?.cardHighlight;

        if(card === null || highlight === null || !dieChallenge?.spiritBox?.isInBound(card.getAbsolutePosition()))
        {
            const dice = dieChallenge?.dice;
            dice?.forEach(die => die.removeGlow());
            indicator.hide();
            return;
        }
        const split = highlight?.getSplit(card)
        split?.affected.forEach(die => die.setGlow());
        split?.unaffected.forEach(die => die.removeGlow());
        indicator.update(card.getAbsolutePosition(), highlight?.indicatorSize || 0)
    }

    public clearGlow(dice: Die[]): void {
        dice.forEach(die => die.setGlow());
    }
}
