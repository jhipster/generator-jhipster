module.exports = { createGenerator: async env =>
    class extends (await env.requireGenerator('jhipster:server')) {
        constructor(args, opts, features) {
            super(args, opts, features);
            throw new Error('blueprint with error');
        }
    }
};
