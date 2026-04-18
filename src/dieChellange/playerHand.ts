import { TransformNode, Scene, Vector3, Camera, Plane, Quaternion } from "@babylonjs/core";
import { Card } from "./card";
import { SpiritBox } from "./spiritBox";
import { DieChallenge } from "./dieChallenge";
import { BoxIndicator } from "./boxIndicator";
import { CardHighlight } from "./cardHighlight";


export class PlayerHand {
    private cards: Card[] = [];
    private handAnchor: TransformNode;
    private arcRadius: number = 5;
    private draggedCard: Card | null = null;
    public cardIndicator: BoxIndicator;

    public setDraggedCard(draggedCard: Card) {
        if (this.draggedCard) this.draggedCard.isDragged = false;
        this.draggedCard = draggedCard;
        if (this.draggedCard) this.draggedCard.isDragged = true;
    }

    public getDraggedCard() { return this.draggedCard; }

    constructor(private dieChellange: DieChallenge) {

        this.handAnchor = new TransformNode("handAnchor", dieChellange);
        this.handAnchor.parent = dieChellange.camera;
        this.cardIndicator = new BoxIndicator(dieChellange, dieChellange.spiritBox.floor)

        this.handAnchor.position = new Vector3(0, -1.5, 3);
        this.handAnchor.rotation = new Vector3(0, 0, 0);
    }

    public addCard(card: Card) {
        card.parent = this.handAnchor;
        this.cards.push(card);
        this.organizeHand();
    }

    public removeCard(card: Card) {
        const initialLength = this.cards.length;
        this.cards = this.cards.filter(c => c.uniqueId !== card.uniqueId);

        if (this.cards.length === initialLength) {
            console.warn("Card was not found in the hand array!");
        }

        this.organizeHand();
    }
    public organizeHand() {
        const total = this.cards.length;
        if (total === 0) return;

        const angleStep = 0.12;
        const startAngle = -(angleStep * (total - 1)) / 2;

        this.cards.forEach((card, i) => {
            const angle = startAngle + (i * angleStep);

            const targetLocalPos = new Vector3(
                Math.sin(angle) * this.arcRadius,
                Math.cos(angle) * this.arcRadius - this.arcRadius,
                i * -0.02
            );
            const targetLocalRot = new Vector3(0, 0, -angle);

            if (card.parent !== this.handAnchor) {
                card.setParent(this.handAnchor, true, true);
            }
            card.animateTo(targetLocalPos, targetLocalRot);
        });
    }

    public OnPointerDown() {
        const pick = this.dieChellange.pick(this.dieChellange.pointerX, this.dieChellange.pointerY, (m) => m instanceof Card);
        if (pick.hit && pick.pickedMesh) {
            this.draggedCard = pick.pickedMesh as Card;
            this.dieChellange.stopAnimation(this.draggedCard);
            this.draggedCard.animations = [];
            this.draggedCard.setParent(null, true, true);
            this.dieChellange.camera.detachControl();
            this.draggedCard.onStartDrag(this);
        }
    }
    public OnPointerUp() {
        if (this.draggedCard) {
            if (this.dieChellange.spiritBox.isInBound(this.draggedCard.getAbsolutePosition())) {
                const play = this.draggedCard.onPlay(this);

                if (play) {
                    this.draggedCard.removed(this);
                    this.organizeHand();
                }
                else {
                    this.draggedCard.onEndDrag(this);
                    this.organizeHand();
                }
            } else {
                this.dieChellange.stopAnimation(this.draggedCard);
                this.draggedCard.animations = [];
                this.draggedCard.setParent(this.handAnchor, true, true);
                this.draggedCard.onEndDrag(this);
                this.organizeHand();
            }
            this.cardIndicator.hide();
            this.draggedCard = null;
            this.dieChellange.camera.attachControl(this.dieChellange.canvas, true);
        }
    }

    private static readonly targetAngleX = Math.PI / 2;
    public PointerMove() {
        if (this.draggedCard) {
            const playHeight = -2.45;
            const dragPlane = Plane.FromPositionAndNormal(
                new Vector3(0, playHeight, 0),
                new Vector3(0, 1, 0)
            );

            const ray = this.dieChellange.createPickingRay(
                this.dieChellange.pointerX,
                this.dieChellange.pointerY,
                null,
                this.dieChellange.camera
            );

            const distance = ray.intersectsPlane(dragPlane);
            if (distance !== null) {
                const intersectPoint = ray.origin.add(ray.direction.scale(distance));

                const cameraForward = this.dieChellange.camera.getForwardRay().direction;
                const flatForward = new Vector3(-cameraForward.x, 0, -cameraForward.z).normalize();

                const lookAtTarget = flatForward.scale(15);

                const diff = lookAtTarget.subtract(this.draggedCard.position);
                const targetYaw = Math.atan2(diff.x, diff.z);

                const targetQuaternion = Quaternion.RotationYawPitchRoll(
                    targetYaw,
                    PlayerHand.targetAngleX,
                    0
                );

                if (!this.draggedCard.rotationQuaternion) {
                    this.draggedCard.rotationQuaternion = Quaternion.FromEulerAngles(
                        this.draggedCard.rotation.x,
                        this.draggedCard.rotation.y,
                        this.draggedCard.rotation.z
                    );
                }

                Quaternion.SlerpToRef(
                    this.draggedCard.rotationQuaternion,
                    targetQuaternion,
                    0.2,
                    this.draggedCard.rotationQuaternion
                );

                this.draggedCard.position = Vector3.Lerp(this.draggedCard.position, intersectPoint, 0.2);
                this.draggedCard.onDrag(this);
            }
        }
    }

    public OnUpdate = () => {
        if (this.cardIndicator != null) {
            CardHighlight.updateIndicator(this.draggedCard, this.cardIndicator)
        }
    }
}

