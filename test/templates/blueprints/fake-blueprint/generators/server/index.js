export const createGenerator = async env => {
  const BaseGenerator = await env.requireGenerator('jhipster:server');
  return class extends BaseGenerator {
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

    get [BaseGenerator.CONFIGURING_EACH_ENTITY]() {
      return super.configuringEachEntity;
    }

    get [BaseGenerator.LOADING_ENTITIES]() {
      return super.loadingEachEntity;
    }

    get [BaseGenerator.PREPARING_EACH_ENTITY]() {
      return super.preparingEachEntity;
    }

    get [BaseGenerator.PREPARING_EACH_ENTITY_FIELD]() {
      return super.preparingEachEntityField;
    }

    get [BaseGenerator.PREPARING_EACH_ENTITY_RELATIONSHIP]() {
      return super.preparingEachEntityRelationship;
    }

    get [BaseGenerator.DEFAULT]() {
      return super.default;
    }

    get [BaseGenerator.WRITING]() {
      return super.writing;
    }

    get [BaseGenerator.WRITING_ENTITIES]() {
      return super.writingEntities;
    }

    get [BaseGenerator.POST_WRITING]() {
      return super.postWriting;
    }

    get [BaseGenerator.POST_WRITING_ENTITIES]() {
      return super.postWritingEntities;
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
