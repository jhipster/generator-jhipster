export const createGenerator = async env => {
  const BaseGenerator = await env.requireGenerator('jhipster:app');
  return class extends BaseGenerator {
    constructor(args, opts, features) {
      super(args, opts, features);

      this.option('foo-bar', {
        desc: 'Sample option',
        type: Boolean,
      });
    }

    get [BaseGenerator.INITIALIZING]() {
      return super.initializing;
    }

    get [BaseGenerator.PROMPTING]() {
      return super.prompting;
    }

    get [BaseGenerator.CONFIGURING]() {
      return super.configuring;
    }

    get [BaseGenerator.COMPOSING]() {
      return super.composing;
    }

    get [BaseGenerator.LOADING]() {
      return super.loading;
    }

    get [BaseGenerator.PREPARING]() {
      return super.preparing;
    }

    get [BaseGenerator.DEFAULT]() {
      return super.default;
    }

    get [BaseGenerator.WRITING]() {
      return super.writing;
    }

    get [BaseGenerator.POST_WRITING]() {
      return super.postWriting;
    }

    get [BaseGenerator.INSTALL]() {
      return super.install;
    }

    get [BaseGenerator.POST_INSTALL]() {
      return super.postInstall;
    }

    get [BaseGenerator.END]() {
      return super.end;
    }
  };
};
