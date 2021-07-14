export class Trick {
    public stance: string = "";
    public rotation: string = "";
    public rotationDirection: string = "";
    public flipTrick: string = "";
    public popModifier: string = "";
    public showDirection: boolean = true;
    public showRotation: boolean = true;

    public fullTrickDescription: string = "";
    public basicFlipTrickDescription: string = "";
    public modifiedTrick: string = "";
    public modifiedTrickDescription: string = "";

    constructor(stance: string, rotation: string, rotationDirection: string, flipTrick: string, popModifier: string) {
        this.stance = stance;
        this.rotation = rotation;
        this.rotationDirection = rotationDirection;
        this.flipTrick = flipTrick;
        this.popModifier = popModifier;

        const includeRotation: boolean = rotation !== "N/A";
        const includeRotationDirection: boolean = rotationDirection !== "N/A";
        const includeFlipTrick: boolean = flipTrick !== "N/A";

        this.basicFlipTrickDescription = stance + " " + flipTrick;
        this.fullTrickDescription = stance + " " + rotationDirection + " " + rotation + " " + flipTrick;
        this.determineTrickDescription();

    }

    private determineTrickDescription() {
        // probably will be a lot of if statements
        this.modifiedTrick = this.flipTrick;

        if (this.rotation === "180") {
            switch (this.flipTrick) {
                case "Varial flip":
                    if (this.rotationDirection = "Backside") {
                        this.modifiedTrick = "Bigflip";
                        this.showDirection = false;
                        this.showRotation = false;
                    }
                    break;
                case "Varial heelflip":
                    if (this.rotation = "Frontside") {
                        this.modifiedTrick = "Big heelflip";
                        this.showDirection = false;
                        this.showRotation = false;
                    }
                    break;
                case "Shuvit":
                    this.modifiedTrick = "Bigspin";
                    this.showDirection = true;
                    this.showRotation = false;
                    break;
                case "360 shuvit":
                    this.modifiedTrick = "Biggerspin";
                    this.showDirection = true;
                    this.showRotation = false;
                    break;
                case "360 flip":
                    this.modifiedTrick = "Biggerflip";
                    this.showDirection = false;
                    this.showRotation = false;
                    break;
                case "Kickflip":
                    this.modifiedTrick = "Flip";
                    this.showDirection = true;
                    this.showRotation = false;
                    break;
                default:
                    break;
            }
        }

        if (this.rotation === "360") {
            switch (this.flipTrick) {
                case "360 flip":
                    this.modifiedTrick = "360 flip";
                    this.showDirection = false;
                    this.showRotation = false;
                    break;
                default:
                    break;
            }
        }


        this.modifiedTrickDescription = this.stance;
        if (this.showDirection) {
            this.modifiedTrickDescription = this.modifiedTrickDescription + " " + this.rotationDirection;
        }
        if (this.showRotation) {
            this.modifiedTrickDescription = this.modifiedTrickDescription + " " + this.rotation;
        }
        this.modifiedTrickDescription = this.modifiedTrickDescription + " " + this.modifiedTrick;

    }
}
