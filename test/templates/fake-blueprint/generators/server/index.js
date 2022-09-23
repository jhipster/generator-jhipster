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
      return super._writing();
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
