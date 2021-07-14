import { autoinject, PLATFORM } from 'aurelia-framework';
import { Router, RouterConfiguration } from "aurelia-router";
import "bootstrap";
import "bootstrap/dist/js/bootstrap";
import * as $ from "jquery";

@autoinject
export class App {


    constructor(public router: Router) { }


    public configureRouter(config: RouterConfiguration, router: Router) {
        config.map([{
            route: ["", "home"],
            name: "home",
            settings: { icon: "fas fa-home", external: false },
            moduleId: PLATFORM.moduleName("../home/home"),
            nav: true,
            title: "Home",
        },
        {
            route: ["skate"],
            name: "skate",
            settings: { icon: "fas fa-home", external: false },
            moduleId: PLATFORM.moduleName("../skate/skate"),
            nav: true,
            title: "skate",
        }
        ]);
        this.router = router;
        config.mapUnknownRoutes("not-found");
    }


}
