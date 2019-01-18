const NeedleBase = require('./needle-base');
const NeedleClientAngular = require('./needle-client-angular');
const NeedleClientReact = require('./needle-client-react');
const NeedleClientWebpack = require('./needle-client-webpack');
const NeedleClientI18n = require('./needle-client-i18n');
const NeedleServerMaven = require('./needle-server-maven');
const NeedleServerCache = require('./needle-server-cache');
const NeedleServerLiquibase = require('./needle-server-liquibase');

module.exports = class {
    constructor(generator) {
        this.needleBase = new NeedleBase(generator);
        this.needleServerMaven = new NeedleServerMaven(generator);
        this.needleServerCache = new NeedleServerCache(generator);
        this.needleServerLiquibase = new NeedleServerLiquibase(generator);
        this.needleClientAngular = new NeedleClientAngular(generator);
        this.needleClientReact = new NeedleClientReact(generator);
        this.needleClientWebpack = new NeedleClientWebpack(generator);
        this.needleClientI18n = new NeedleClientI18n(generator);
    }
};
