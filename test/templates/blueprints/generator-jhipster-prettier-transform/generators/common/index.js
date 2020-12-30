module.exports = {
    createGenerator: env => class extends env.requireGenerator('jhipster:common') {
        constructor(args, opts) {
            super(args, opts);
            this.sbsBlueprint = true;
        }

        get writing() {
            return {
                prettier() {
                    this.writeDestination('.prettierrc', 'tabWidth: 10');
                }
            };
        }
    }
};
