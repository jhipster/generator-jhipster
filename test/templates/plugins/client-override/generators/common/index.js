module.exports = {
    plugin,
    subGen: 'client'
};

function plugin(Generator) {
    return class NewGenerator extends Generator {
        constructor(args, opts) {
            super(args, { fromBlueprint: true, ...opts }); // fromBlueprint variable is important
            const jhContext = (this.jhipsterContext = this.options.jhipsterContext);
            if (!jhContext) {
                this.error("This is a JHipster blueprint and should be used only like 'jhipster --blueprint myblueprint')}");
            }
            this.configOptions = jhContext.configOptions || {};
            // This sets up options for this sub generator and is being reused from JHipster
            jhContext.setupClientOptions(this, jhContext);
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
            const phaseFromJHipster = super._writing();
            const customPhaseSteps = {
                addDummyProperty() {
                    this.addNpmDependency('dummy-blueprint-property', '2.0');
                }
            };
            return { ...phaseFromJHipster, ...customPhaseSteps };
        }

        get install() {
            return super._install();
        }

        get end() {
            return super._end();
        }
    };
};
