export class WeightedEntry {
    public weight: number = 1;
    public entry: string = "";

    constructor(entry: string, weight: number) {
        this.entry = entry;
        this.weight = weight;
    }
}
