import { autoinject } from 'aurelia-framework';
import { Entry } from '../../common/models/entry';
import { DataService } from './../../common/services/data-service';

@autoinject
export class Home {
    public collectionData: Entry[] = [];

    constructor(public dataService: DataService) { }

    public activate() {
        this.collectionData = this.dataService.generateSampleData();
    }

}
