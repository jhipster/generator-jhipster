module.exports = { createGenerator: env =>
    class extends env.requireGenerator('jhipster:server') {
        constructor(args, opts) {
            super(args, opts);
            throw new Error('blueprint with error');
        }
    }
};
