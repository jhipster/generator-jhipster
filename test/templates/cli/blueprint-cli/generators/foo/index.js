export const createGenerator = async env => {
  const BaseGenerator = await env.requireGenerator('jhipster:base');
  return class extends BaseGenerator {
    constructor(args, opts, features) {
      super(args, opts, features);

      this.option('foo-bar', {
        desc: 'Sample option',
        type: Boolean,
      });
    }

    get [BaseGenerator.INITIALIZING]() {
      /* eslint-disable no-console */
      console.log('Running foo');
      if (this.options.fooBar) {
        /* eslint-disable no-console */
        console.log('Running bar');
        console.log(this.options.fooBar);
      }
    }
  };
};
