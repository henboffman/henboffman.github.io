import { WeightedEntry } from './../models/weighted-entry';
import { Trick } from './../models/trick';
export class TrickService {

    private stances: WeightedEntry[] = [
        new WeightedEntry("Regular", 0.45),
        new WeightedEntry("Nollie", 0.15),
        new WeightedEntry("Switch", 0.25),
        new WeightedEntry("Fakie", 0.15)

    ];

    private rotationDirections: WeightedEntry[] = [
        new WeightedEntry("Backside", 0.4),
        new WeightedEntry("Frontside", 0.4),
        new WeightedEntry("", 0.2)
    ];

    private rotations: WeightedEntry[] = [
        new WeightedEntry("180", 0.3),
        new WeightedEntry("360", 0.2),
        new WeightedEntry("", 0.5)
    ];

    private flipTricks: WeightedEntry[] = [
        new WeightedEntry("Kickflip", 0.15),
        new WeightedEntry("Heelflip", 0.15),
        new WeightedEntry("Varial flip", 0.075),
        new WeightedEntry("Varial heelfip", 0.075),
        new WeightedEntry("Hardflip", 0.05),
        new WeightedEntry("Inward Heelflip", 0.05),
        new WeightedEntry("Shuvit", 0.2),
        new WeightedEntry("360 flip", 0.1),
        new WeightedEntry("360 shuvit", 0.1),
        new WeightedEntry("", 0.05)
    ];
    private popModifiers: string[] = ["Pop Required", "Pop Optional", "No Pop"];

    public generateTrick(): Trick {

        const stance: string = this.generateStance();
        const flipTrick: string = this.generateFlipTrick();
        const rotation: string = this.generateRotation();
        let rotationDirection: string = this.generateRotationDirection();
        const popModifier: string = this.generatePopModifier();

        // if no rotation, we don't need rotation direction
        if (rotation === "") {
            rotationDirection = "";
        } else if (rotation !== "") {
            // if rotation is specified, we must determine a direction
            while (rotationDirection === "") {
                rotationDirection = this.generateRotationDirection();
            }
        }

        let trick = new Trick(stance, rotation, rotationDirection, flipTrick, popModifier);

        return trick;
    }

    private generateStance(): string {
        return this.generateSelectionFromWeightedList(this.stances);
        // return this.stance[Math.floor(Math.random() * this.stance.length)].entry;
    }

    private generateFlipTrick(): string {
        return this.generateSelectionFromWeightedList(this.flipTricks);
        // return this.flipTrick[Math.floor(Math.random() * this.flipTrick.length)];
    }

    private generateRotation(): string {
        return this.generateSelectionFromWeightedList(this.rotations);
        // return this.rotation[Math.floor(Math.random() * this.rotation.length)].entry;
    }

    private generateRotationDirection(): string {
        return this.generateSelectionFromWeightedList(this.rotationDirections);
        // return this.rotationDirection[Math.floor(Math.random() * this.rotationDirection.length)].entry;
    }

    private generatePopModifier(): string {
        return this.popModifiers[Math.floor(Math.random() * this.popModifiers.length)];
    }

    private generateSelectionFromWeightedList(weightedList: WeightedEntry[]): string {
        const weightTotal: number = 1; // TODO: update this to get the sum from the list
        let randomValue: number = Math.random();
        for (let i = 0; i < weightedList.length - 1; i++) {
            if (randomValue <= weightedList[i].weight) {
                return weightedList[i].entry;
            } else {
                randomValue -= weightedList[i].weight;
            }
        }

        // if no value was returned, return something at random
        return weightedList[Math.floor(Math.random() * weightedList.length)].entry;
    }
}
