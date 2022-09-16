module.exports = { createGenerator: env =>
    class extends env.requireGenerator('jhipster:server') {
        constructor(args, opts, features) {
            super(args, opts, features);
            throw new Error('blueprint with error');
        }
    }
};
