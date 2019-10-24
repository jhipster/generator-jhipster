const debug = require('debug')('interceptor');

const printDiff = function() {
    if (!debug.enabled) return;
    const self = this;
    const initialSelf = this.initialSelf;
    const diff = Object.getOwnPropertyNames(this)
        .filter(key => !key.startsWith('_'))
        .sort()
        .reduce((diff, key) => {
            if (['args', 'arguments', 'async', 'initialSelf'].includes(key)) return diff;
            const pd = Object.getOwnPropertyDescriptor(self, key);
            if (typeof pd.value === 'object' && !Array.isArray(pd.value)) return diff;
            const otherPd = Object.getOwnPropertyDescriptor(initialSelf, key);
            if (!otherPd || otherPd.value !== pd.value) {
                Object.defineProperty(diff, key, pd);
            }
            return diff;
        }, {});
    debug('Namespace: %O', this.options.namespace);
    debug('%O', diff);
};

const registerDiff = function(generator) {
    generator.initialSelf = { ...generator };
    generator.queueMethod(printDiff.bind(generator), 'printDiff', 'writing');
};

module.exports = {
    registerDiff
};
