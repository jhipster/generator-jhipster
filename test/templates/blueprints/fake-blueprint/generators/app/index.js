const createGenerator = async env => class extends (await env.requireGenerator('jhipster:app')) {
    constructor(args, opts, features) {
        super(args, opts, { taskPrefix: '>', ...features });

        this.option('foo-bar', {
            desc: 'Sample option',
            type: Boolean,
        });

        if (this.options.help) {
           return;
        }

        const jhContext = (this.jhipsterContext = this.options.jhipsterContext);
        if (!jhContext) {
            this.error("This is a JHipster blueprint and should be used only like 'jhipster --blueprints myblueprint')}");
        }
    }

    get ['>initializing']() {
        return super.initializing;
    }

    get ['>prompting']() {
        return super.prompting;
    }

    get ['>configuring']() {
        return super.configuring;
    }

    get ['>composing']() {
      return super.composing;
    }

    get ['>loading']() {
      return super.loading;
    }

    get ['>preparing']() {
      return super.preparing;
    }

    get ['>default']() {
        return super.default;
    }

    get ['>writing']() {
        return super.writing;
    }

    get ['>postWriting']() {
        return super.postWriting;
    }

    get ['>install']() {
        return super.install;
    }

    get ['>postInstall']() {
        return super.postInstall;
    }

    get ['>end']() {
        return super.end;
    }
};

module.exports = { createGenerator };
