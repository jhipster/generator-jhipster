/* eslint-disable global-require */

const getDebug = function(name) {
    let debug = require('debug')(`interceptor:${name}`);
    if (debug.enabled) {
        return { debug, pretty: true, pattern: '%O' };
    }
    debug = require('debug')(`interceptor-ugly:${name}`);
    if (debug.enabled) {
        return { debug, pretty: false, pattern: '%o' };
    }
    return undefined;
};

const printDiff = function(generator) {
    const d = getDebug('diff');
    if (!d) return;

    const initialSelf = generator.initialSelf;
    const diff = Object.getOwnPropertyNames(generator)
        .filter(key => !key.startsWith('_'))
        .sort()
        .reduce((diff, key) => {
            if (['args', 'arguments', 'async', 'initialSelf'].includes(key)) return diff;
            const pd = Object.getOwnPropertyDescriptor(generator, key);
            if (typeof pd.value === 'object' && !Array.isArray(pd.value)) return diff;
            const otherPd = Object.getOwnPropertyDescriptor(initialSelf, key);
            if (!otherPd || otherPd.value !== pd.value) {
                Object.defineProperty(diff, key, pd);
            }
            return diff;
        }, {});
    const debug = d.debug;
    debug('Namespace: %s', generator.options.namespace);
    debug(d.pattern, diff);
};

const registerDiff = function(generator) {
    generator.initialSelf = { ...generator };
    generator.queueMethod(printDiff.bind(generator, generator), 'printDiff', 'writing');
};

module.exports = {
    registerDiff,
    printDiff
};
