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
        return super._initializing();
    }

    get ['>prompting']() {
        return super._prompting();
    }

    get ['>configuring']() {
        return super._configuring();
    }

    get ['>composing']() {
      return super._composing();
    }

    get ['>loading']() {
      return super._loading();
    }

    get ['>preparing']() {
      return super._preparing();
    }

    get ['>default']() {
        return super._default();
    }

    get ['>writing']() {
        return super._writing();
    }

    get ['>postWriting']() {
        return super._postWriting();
    }

    get ['>install']() {
        return super._install();
    }

    get ['>postInstall']() {
        return super._postInstall();
    }

    get ['>end']() {
        return super._end();
    }
};

module.exports = { createGenerator };
