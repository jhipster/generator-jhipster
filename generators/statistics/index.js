
const axios = require('axios');
const Config = require('conf');


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

        if (this.optOut) {
            this.doNotAskCounter++;
            this.config.set('doNotAskCounter', this.doNotAskCounter % (DO_NOT_ASK_LIMIT));
        }
    }

    shouldWeAskForOptIn() {
        return !this.optOut || (this.doNotAskCounter >= DO_NOT_ASK_LIMIT);
    }

    setOptoutStatus(status) {
        this.config.set('optOut', status);
        this.optOut = status;
    }

    sendYoRc(yorc) {
        axios.post(`${STATISTICS_API_PATH}statistics/entry`, { 'generator-jhipster': yorc, 'generator-id': this.clientId });
    }
}

module.exports = Statistics;
