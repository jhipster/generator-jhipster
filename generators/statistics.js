
const axios = require('axios');
const Config = require('conf');
const osLocale = require('os-locale');
const os = require('os');
const inquirer = require('inquirer');

const DO_NOT_ASK_LIMIT = 5;

const STATISTICS_API_PATH = 'http://localhost:8080/api/';

class Statistics {
    constructor() {
        this.config = new Config({
            configName: 'jhipster-insight',
            defaults: {
                clientId: this.guid(),
                doNotAskCounter: 0
            }
        });
        this.statisticsAPIPath = STATISTICS_API_PATH;
        this.clientId = this.config.get('clientId');
        this.doNotAskCounter = this.config.get('doNotAskCounter');
        this.optOut = this.config.get('optOut');
        this.configAxios();
    }

    postRequest(url, data, force = false) {
        if (!this.optOut || force) {
            this.axiosClient.post(url, data).then(
                () => {},
                (error) => {
                    if (this.axiosProxyClient) {
                        this.axiosProxyClient.post(url, data)
                            .then(() => {})
                            .catch(() => {});
                    }
                }
            ).catch(() => {});
        }
    }

    postWithProxy(url, data, config) {
        return this.axiosProxyClient.post(url, data);
    }

    configAxios() {
        this.axiosClient = axios.create({
            baseURL: STATISTICS_API_PATH
        });

        const npmHttpsProxy = process.env.npm_config_https_proxy || process.env.npm_config_proxy;
        const npmHttpProxy = process.env.npm_config_http_proxy || process.env.npm_config_proxy;
        const envProxy = process.env.HTTPS_PROXY || process.env.HTTP_PROXY;
        const proxySettings = npmHttpsProxy || npmHttpProxy || envProxy;
        if (proxySettings) {
            const splitted = proxySettings.split(':');
            this.axiosProxyClient = axios.create({
                baseURL: STATISTICS_API_PATH,
                proxy: { host: splitted[0], port: splitted[1] }
            });
        }
    }

    shouldWeAskForOptIn() {
        if (this.optOut) {
            this.doNotAskCounter++;
            this.config.set('doNotAskCounter', this.doNotAskCounter % (DO_NOT_ASK_LIMIT));
        }
        return this.optOut || (this.doNotAskCounter >= DO_NOT_ASK_LIMIT);
    }

    setOptoutStatus(status) {
        this.config.set('optOut', status);
        this.optOut = status;
    }

    sendYoRc(yorc, generatorVersion) {
        this.postRequest('s/entry', {
            'generator-jhipster': yorc,
            'generator-id': this.clientId,
            'generator-version': generatorVersion,
            'git-provider': 'local',
            'node-version': process.version,
            os: `${os.platform()}:${os.release()}`,
            arch: os.arch(),
            cpu: os.cpus()[0].model,
            cores: os.cpus().length,
            memory: os.totalmem(),
            'user-language': osLocale.sync()
        });
    }

    sendSubGenEvent(source, type, event) {
        const strEvent = event === '' ? event : JSON.stringify(event);
        this.postRequest(`s/event/${this.clientId}`, { source, type, event: strEvent });
    }

    sendEntityStats(fields, relationship, pagination, dto, service, fluentMethods) {
        this.postRequest(`s/entity/${this.clientId}`, {
            fields,
            relationship,
            pagination,
            dto,
            service,
            fluentMethods
        });
    }

    sendCrashReport(source, stack, generatorVersion, yorc, jdl) {
        inquirer.prompt([{
            when: () => true,
            type: 'confirm',
            name: 'accept',
            message: 'JHipster has enccountered an error!\nSending a crash report would help us a lot finding out what is wrong. Would you like to send a crash report ? Data will be anonymized.',
            default: true
        }]).then((answers) => {
            const env = JSON.stringify({
                'generator-version': generatorVersion,
                'git-provider': 'local',
                'node-version': process.version,
                os: `${os.platform()}:${os.release()}`,
                arch: os.arch(),
                cpu: os.cpus()[0].model,
                cores: os.cpus().length,
                memory: os.totalmem(),
                'user-language': osLocale.sync()
            });
            this.postRequest('s/report', {
                source,
                env,
                stack,
                yorc,
                jdl: 'dummy value'
            }, true);
        });
    }

    guid() {
        function s4() {
            return Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1);
        }
        return `${s4() + s4()}-${s4()}-${s4()}-${s4()}-${s4()}${s4()}${s4()}`;
    }
}

module.exports = Statistics;
