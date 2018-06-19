
const axios = require('axios');
const Config = require('conf');
const osLocale = require('os-locale');
const os = require('os');

const DO_NOT_ASK_LIMIT = 5;
const STATISTICS_API_PATH = 'http://localhost:8080/api/';

class Statistics {
    constructor() {
        this.config = new Config({
            configName: 'jhipster-insight',
            defaults: {
                clientId: Math.floor(Date.now() * Math.random()),
                doNotAskCounter: 0
            }
        });

        this.clientId = this.config.get('clientId');
        this.doNotAskCounter = this.config.get('doNotAskCounter');
        this.optOut = this.config.get('optOut');
        this.configAxios();
    }

    postRequest(url, data) {
        if (!this.optOut) {
            this.axiosClient.post(url, data).then(
                () => {},
                () => {
                    if (this.axiosProxyClient) {
                        this.axiosProxyClient.post(url, data)
                            .then(() => {})
                            .catch(() => {});
                    }
                }
            ).catch(() => {});
        }
    }

    configAxios() {
        this.axiosClient = axios.create({
            baseURL: STATISTICS_API_PATH
        });

        let splitted;
        if (process.env.HTTPS_PROXY) {
            splitted = process.env.HTTPS_PROXY.split(':');
        } else if (process.env.HTTP_PROXY) {
            splitted = process.env.HTTP_PROXY.split(':');
        }
        if (splitted) {
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
}

module.exports = Statistics;
