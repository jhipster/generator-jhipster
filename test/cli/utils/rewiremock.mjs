// rewiremock.es6.js
import rewiremock, { addPlugin, plugins } from 'rewiremock';
// settings
// ....
rewiremock.overrideEntryPoint(module); // this is important. This command is "transfering" this module parent to rewiremock
addPlugin(plugins.relative);
// eslint-disable-next-line import/prefer-default-export
export { rewiremock };
