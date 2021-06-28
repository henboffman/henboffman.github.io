import { Aurelia } from 'aurelia-framework';
import * as environment from '../config/environment.json';
import 'bootstrap'; // Import the Javascript
import 'bootstrap/dist/css/bootstrap.css'; // Import the CSS
import "@fortawesome/fontawesome-free";
import "@fortawesome/fontawesome-free/css/all.css";
import { PLATFORM } from 'aurelia-pal';

export function configure(aurelia: Aurelia): void {
  aurelia.use
    .standardConfiguration()
    .feature(PLATFORM.moduleName('resources/index'));

  aurelia.use.developmentLogging(environment.debug ? 'debug' : 'warn');

  if (environment.testing) {
    aurelia.use.plugin(PLATFORM.moduleName('aurelia-testing'));
  }

  aurelia.start().then(() => aurelia.setRoot(PLATFORM.moduleName('routes/shell/shell')));
}
