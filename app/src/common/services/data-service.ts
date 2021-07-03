import { Type } from '../models/type';
import { Entry } from './../models/entry';
export class DataService {

    public themes: Entry[] = [];

    public generateSampleData(): Entry[] {
        let collection: Entry[] = this.generateEntryCollection(Type.Theme);
        console.log(collection);
        return collection;
    }

    private generateEntryCollection(currentType: Type): Entry[] {
        let collection: Entry[] = [];
        let collectionName: string = currentType === Type.Theme ? "Theme" : currentType === Type.Epic ? "Epic" : "Feature";

        for (let index = 0; index < 5; index++) {
            let entry: Entry = new Entry(collectionName + " " + index, "desciption for " + collectionName + " " + index, currentType);

            if (currentType === Type.Theme || currentType === Type.Epic) {
                let nextType: Type = currentType === Type.Theme ? Type.Epic : Type.Feature;
                entry.children = this.generateEntryCollection(nextType);
            }
            collection.push(entry);
        }
        return collection;
    }

}
