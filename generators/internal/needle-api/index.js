const Base = require('./needle-base');
const ClientAngular = require('./needle-client-angular');
const ClientReact = require('./needle-client-react');
const ClientWebpack = require('./needle-client-webpack');
const ClientI18n = require('./needle-client-i18n');
const ServerMaven = require('./needle-server-maven');
const ServerGradle = require('./needle-server-gradle');
const ServerCache = require('./needle-server-cache');
const ServerLiquibase = require('./needle-server-liquibase');

module.exports = class NeedleApi {
    constructor(generator) {
        this.base = new Base(generator);
        this.serverMaven = new ServerMaven(generator);
        this.clientAngular = new ClientAngular(generator);
        this.clientReact = new ClientReact(generator);
        this.clientWebpack = new ClientWebpack(generator);
        this.clientI18n = new ClientI18n(generator);
        this.serverCache = new ServerCache(generator);
        this.serverLiquibase = new ServerLiquibase(generator);
        this.serverGradle = new ServerGradle(generator);
    }
};
