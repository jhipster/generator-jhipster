const createGenerator = async env => class extends (await env.requireGenerator('jhipster:server')) {
  constructor(args, opts, features) {
      super(args, opts, { taskPrefix: '>', ...features });

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

  get ['>configuringEachEntity']() {
    return super.configuringEachEntity;
  }

  get ['>loadingEachEntity']() {
    return super.loadingEachEntity;
  }

  get ['>preparingEachEntity']() {
    return super.preparingEachEntity;
  }

  get ['>preparingEachEntityField']() {
    return super.preparingEachEntityField;
  }

  get ['>preparingEachEntityRelationship']() {
    return super.preparingEachEntityRelationship;
  }

  get ['>default']() {
      return super.default;
  }

  get ['>writing']() {
      return super.writing;
  }

  get ['>writingEntities']() {
      return super.writingEntities;
  }

  get ['>postWriting']() {
      return super.postWriting;
  }

  get ['>postWritingEntities']() {
      return super.postWritingEntities;
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
