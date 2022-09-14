module.exports = {
    createGenerator: env => class extends env.requireGenerator('jhipster:common') {
        constructor(args, opts, features) {
            super(args, opts, features);
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
