import { Type } from "./type";

export class Entry {
    public name: string = "";
    public description: string = "";
    public type: Type | null = null;
    public tags: string[] = [];
    public children: Entry[] = [];
    public isVisible: boolean = true;

    constructor(name: string, description: string, type: Type) {
        this.name = name;
        this.description = description;
        this.children = [];
        this.tags = [];
        this.type = type;
    }

    public toggleVisibility() {
        this.isVisible = !this.isVisible;
    }
}
