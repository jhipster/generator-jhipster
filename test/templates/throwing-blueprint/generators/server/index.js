const createGenerator = env => class extends env.requireGenerator('jhipster:server') {
    constructor(args, opts) {
        super(args, opts);
        throw new Error('blueprint with error');
    }

    get initializing() {
        return super._initializing();
    }

    get prompting() {
        return super._prompting();
    }

    get configuring() {
        return super._configuring();
    }

    get default() {
        return super._default();
    }

    get writing() {
        return super._writing();
    }

    get install() {
        return super._install();
    }

    get end() {
        return super._end();
    }
};

module.exports = { createGenerator };
