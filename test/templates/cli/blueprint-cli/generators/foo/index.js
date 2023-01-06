const Generator = require('yeoman-generator');

module.exports = class extends Generator {
  constructor(args, opts, features) {
    super(args, opts, features);

    this.option('foo-bar', {
      desc: 'Sample option',
      type: Boolean,
    });
  };

  initializing() {
    /* eslint-disable no-console */
    console.log('Running foo');
    if (this.options.fooBar) {
      /* eslint-disable no-console */
      console.log('Running bar');
      console.log(this.options.fooBar);
    }
  }
};
