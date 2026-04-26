import {
  TransformNode,
  Vector3,
  Plane,
  Quaternion,
  Color3,
} from "@babylonjs/core";
import { Card } from "./card";
import { DieChallenge } from "./dieChallenge";
import { CardHighlight } from "./cardHighlight";
import { playableCard } from "./playableCard";
import { ReRollCard } from "./Cards/reRollCard";
import { ScoreCard } from "./Cards/scoreCard";
import { ResetCard } from "./Cards/reSetCard";
import { BoxIndicator } from "./boxIndicator";

export class PlayerHand {
  private cards: playableCard[] = [];
  private handAnchor: TransformNode;
  private arcRadius: number = 5;
  private draggedCard: playableCard | null = null;
  private hilightCard: Card;
  public cardIndicator: BoxIndicator;
  private resetMode: boolean = false;

  public setDraggedCard(draggedCard: playableCard | null) {
    if (draggedCard?.id === this.hilightCard.id) draggedCard = null;
    if (this.draggedCard) this.draggedCard.isDragged = false;
    this.draggedCard = draggedCard;
    const camera = this.dieChellange.camera;
    const isAttached = !!camera.inputs.attachedToElement;
    if (draggedCard) {
      this.dieChellange.camera.angularSensibilityX = Infinity;
      this.dieChellange.camera.angularSensibilityY = Infinity;
      draggedCard.isDragged = true;
    } else {
      this.dieChellange.camera.angularSensibilityX = 1000;
      this.dieChellange.camera.angularSensibilityY = 1000;
    }
  }

  public getDraggedCard() {
    return this.draggedCard;
  }

  constructor(private dieChellange: DieChallenge) {
    this.hilightCard = new Card(
      "Hilight Card",
      dieChellange,
      "",
      "",
      Color3.White(),
    );
    this.hilightCard.setParent(dieChellange.camera);
    this.hilightCard.setEnabled(false);
    this.hilightCard.isPickable = false;

    this.handAnchor = new TransformNode("handAnchor", dieChellange);
    this.handAnchor.parent = dieChellange.camera;
    this.cardIndicator = new BoxIndicator(
      dieChellange,
      dieChellange.spiritBox.floor,
    );

    this.handAnchor.position = new Vector3(0, -1.5, 3);
    this.handAnchor.rotation = new Vector3(0, 0, 0);
  }

  public reSet() {
    this.resetMode = true;
    this.cards.forEach((card) => card.remove(this));
    this.resetMode = false;

    this.addCard(new ReRollCard("reroll1", this.dieChellange));
    this.addCard(new ReRollCard("reroll2", this.dieChellange));
    this.addCard(new ReRollCard("reroll3", this.dieChellange));
    this.addCard(new ScoreCard("score1", this.dieChellange));
    this.addCard(new ScoreCard("score2", this.dieChellange));
  }

  public addCard(card: playableCard) {
    card.parent = this.handAnchor;
    this.cards.push(card);
    this.organizeHand();
  }

  public removeCard(card: playableCard) {
    const initialLength = this.cards.length;
    this.cards = this.cards.filter((c) => c.uniqueId !== card.uniqueId);

    if (this.cards.length === initialLength) {
      console.warn("Card was not found in the hand array!");
    }

    if (
      !this.resetMode &&
      !this.cards.some((card) => card instanceof ScoreCard)
    ) {
      if (!this.cards.some((card) => card instanceof ReRollCard))
        this.addCard(new ReRollCard("reroll", this.dieChellange));
      if (!this.cards.some((card) => card instanceof ResetCard))
        this.addCard(new ResetCard("reroll", this.dieChellange));
    }

    this.organizeHand();
  }
  public organizeHand() {
    const total = this.cards.length;
    if (total === 0) return;

    const angleStep = 0.12;
    const startAngle = -(angleStep * (total - 1)) / 2;

    this.cards.forEach((card, i) => {
      const angle = startAngle + i * angleStep;

      const targetLocalPos = new Vector3(
        Math.sin(angle) * this.arcRadius,
        Math.cos(angle) * this.arcRadius - this.arcRadius,
        i * -0.02,
      );
      const targetLocalRot = new Vector3(0, 0, -angle);

      if (card.parent !== this.handAnchor) {
        card.setParent(this.handAnchor, true, true);
      }
      card.animateTo(targetLocalPos, targetLocalRot);
    });
  }

  public OnPointerDown() {
    const pick = this.dieChellange.pick(
      this.dieChellange.pointerX,
      this.dieChellange.pointerY,
      (m) => m instanceof playableCard && m.isPickable,
    );
    if (pick.hit && pick.pickedMesh instanceof playableCard) {
      this.setDraggedCard(pick.pickedMesh);
      this.dieChellange.stopAnimation(this.draggedCard);
      if (this.draggedCard) this.draggedCard.animations = [];
      this.draggedCard?.setParent(null, true, true);
      this.draggedCard?.setInHand(false);
      this.draggedCard?.onStartDrag(this);
      this.hilightCard.setEnabled(false);
    }
  }
  public OnPointerUp() {
    if (this.draggedCard) {
      if (
        this.dieChellange.spiritBox.isInBound(
          this.draggedCard.getAbsolutePosition(),
        )
      ) {
        const play = this.draggedCard.onPlay(this);

        if (play) {
          this.draggedCard.remove(this);
          this.organizeHand();
        } else {
          this.draggedCard.setInHand(true);
          this.draggedCard.onEndDrag(this);
          this.organizeHand();
        }
      } else {
        this.dieChellange.stopAnimation(this.draggedCard);
        this.draggedCard.animations = [];
        this.draggedCard.setParent(this.handAnchor, true, true);
        this.draggedCard.setInHand(true);
        this.draggedCard.onEndDrag(this);
        this.organizeHand();
      }
    }

    this.cardIndicator.hide();
    this.setDraggedCard(null);
  }

  private static readonly targetAngleX = Math.PI / 2;
  public PointerMove() {
    if (this.draggedCard) {
      const playHeight = -2.45;
      const dragPlane = Plane.FromPositionAndNormal(
        new Vector3(0, playHeight, 0),
        new Vector3(0, 1, 0),
      );

      const ray = this.dieChellange.createPickingRay(
        this.dieChellange.pointerX,
        this.dieChellange.pointerY,
        null,
        this.dieChellange.camera,
      );

      const distance = ray.intersectsPlane(dragPlane);
      if (distance !== null) {
        const intersectPoint = ray.origin.add(ray.direction.scale(distance));

        const cameraForward =
          this.dieChellange.camera.getForwardRay().direction;
        const flatForward = new Vector3(
          -cameraForward.x,
          0,
          -cameraForward.z,
        ).normalize();

        const lookAtTarget = flatForward.scale(20);

        const diff = lookAtTarget.subtract(this.draggedCard.position);
        const targetYaw = Math.atan2(diff.x, diff.z);

        const targetQuaternion = Quaternion.RotationYawPitchRoll(
          targetYaw + Math.PI,
          PlayerHand.targetAngleX,
          0,
        );

        if (!this.draggedCard.rotationQuaternion) {
          this.draggedCard.rotationQuaternion = Quaternion.FromEulerAngles(
            this.draggedCard.rotation.x,
            this.draggedCard.rotation.y,
            this.draggedCard.rotation.z,
          );
        }

        Quaternion.SlerpToRef(
          this.draggedCard.rotationQuaternion,
          targetQuaternion,
          0.2,
          this.draggedCard.rotationQuaternion,
        );

        this.draggedCard.position = Vector3.Lerp(
          this.draggedCard.position,
          intersectPoint,
          0.2,
        );
        this.draggedCard.onDrag(this);
      }
    }
  }

  public OnUpdate = () => {
    this.handleHover();

    if (this.cardIndicator != null) {
      CardHighlight.updateIndicator(this.draggedCard, this.cardIndicator);
    }
  };

  private hoverStartTime: number = 0;
  private currentHoveredCardId: number | null = null;
  private readonly hoverDelay: number = 200;
  public handleHover() {
    if (this.draggedCard) {
      this.hilightCard.setEnabled(false);
      this.currentHoveredCardId = null;
      return;
    }

    const pick = this.dieChellange.pick(
      this.dieChellange.pointerX,
      this.dieChellange.pointerY,
      (m) =>
        m instanceof playableCard &&
        m.isPickable &&
        m.id != this.hilightCard.id,
    );

    if (
      pick.hit &&
      pick.pickedMesh &&
      pick.pickedMesh instanceof playableCard
    ) {
      const hoveredCard = pick.pickedMesh;
      const now = performance.now();

      if (this.currentHoveredCardId !== hoveredCard.uniqueId) {
        this.currentHoveredCardId = hoveredCard.uniqueId;
        this.hoverStartTime = now;
        this.hilightCard.setEnabled(false);
      } else if (now - this.hoverStartTime >= this.hoverDelay) {
        this.hilightCard.material = hoveredCard.material;
        this.hilightCard.setEnabled(true);
        this.hilightCard.rotation = Vector3.Zero();
        this.hilightCard.position = new Vector3(0, 0, 2);
        this.hilightCard.scaling = new Vector3(1, 1, 1);
      }
    } else {
      this.hilightCard.setEnabled(false);
      this.currentHoveredCardId = null;
      this.hoverStartTime = 0;
    }
  }
}
