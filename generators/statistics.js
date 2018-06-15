
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
        this.sendData(() => {
            axios.post(`${STATISTICS_API_PATH}s/entry`, {
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
            }).then(() => {}).catch(() => {});
        });
    }

    sendSubGenEvent(source, type, event) {
        this.sendData(() => {
            const strEvent = event === '' ? event : JSON.stringify(event);
            axios.post(`${STATISTICS_API_PATH}s/event/${this.clientId}`, { source, type, event: strEvent }).then(() => {}).catch(() => {});
        });
    }

    sendEntityStats(fields, relationship, pagination, dto, service, fluentMethods) {
        this.sendData(() => {
            axios.post(`${STATISTICS_API_PATH}s/entity/${this.clientId}`, {
                fields,
                relationship,
                pagination,
                dto,
                service,
                fluentMethods
            }).then(() => {}).catch(() => {});
        });
    }

    sendData(callback) {
        if (!this.optOut) {
            callback();
        }
    }
}

module.exports = Statistics;
