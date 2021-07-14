import { Trick } from './../../common/models/trick';
import { TrickService } from './../../common/services/trick-service';
import { autoinject } from 'aurelia-framework';
@autoinject
export class Skate {

    public trickToDisplay!: Trick;

    constructor(public trickService: TrickService) { }

    public generateTrick() {
        this.trickToDisplay = this.trickService.generateTrick();
    }

}
