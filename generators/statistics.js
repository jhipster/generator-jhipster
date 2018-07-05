const uuid = require('uuid/v1');
const Config = require('conf');
const osLocale = require('os-locale');
const axios = require('axios');
const os = require('os');

const DO_NOT_ASK_LIMIT = 100;

const API_PATH = 'http://localhost:8080/api';

class Statistics {
    constructor() {
        this.config = new Config({
            configName: 'jhipster-insight',
            defaults: {
                clientId: uuid(),
                doNotAskCounter: 0
            }
        });
        this.statisticsAPI = API_PATH;
        this.clientId = this.config.get('clientId');
        this.doNotAskCounter = this.config.get('doNotAskCounter');
        this.optOut = this.config.get('optOut');
        this.configProxy();
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

    configProxy() {
        this.axiosClient = axios.create({
            baseURL: this.statisticsAPI
        });

        const npmHttpsProxy = process.env.npm_config_https_proxy || process.env.npm_config_proxy;
        const npmHttpProxy = process.env.npm_config_http_proxy || process.env.npm_config_proxy;
        const envProxy = process.env.HTTPS_PROXY || process.env.HTTP_PROXY;
        const proxySettings = npmHttpsProxy || npmHttpProxy || envProxy;
        if (proxySettings) {
            const splitted = proxySettings.split(':');
            this.axiosProxyClient = axios.create({
                baseURL: this.statisticsAPI,
                proxy: { host: splitted[0], port: splitted[1] }
            });
        }
    }

    shouldWeAskForOptIn() {
        if (this.optOut) {
            this.doNotAskCounter++;
            this.config.set('doNotAskCounter', this.doNotAskCounter % (DO_NOT_ASK_LIMIT));
        }

        return this.optOut === undefined || (this.optOut && this.doNotAskCounter >= DO_NOT_ASK_LIMIT);
    }

    setOptoutStatus(status) {
        this.config.set('optOut', status);
        this.optOut = status;
    }

    sendYoRc(yorc, generatorVersion) {
        this.postRequest('/s/entry', {
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
        this.postRequest(`/s/event/${this.clientId}`, { source, type, event: strEvent });
    }

    sendEntityStats(fields, relationships, pagination, dto, service, fluentMethods) {
        this.postRequest(`/s/entity/${this.clientId}`, {
            fields,
            relationships,
            pagination,
            dto,
            service,
            fluentMethods
        });
    }
}

let currentInstance;

function get() {
    if (!currentInstance) {
        currentInstance = new Statistics();
    }

    return currentInstance;
}

module.exports = get();
