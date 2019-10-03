module.exports = function(Generator) {
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

        get writing() {
            return {
                addDummyProperty() {
                    this.composeBlueprint('generator-jhipster-myblueprint', 'custom-client', this.options);
                }
            };
        }
    };
};
