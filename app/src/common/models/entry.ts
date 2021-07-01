export class Entry {
    public name: string = "";
    public description: string = "";
    public children: Entry[] = [];

    constructor(name: string, description: string, children: Entry[] = []) {
        this.name = name;
        this.description = description;
        this.children = children;
    }
}
