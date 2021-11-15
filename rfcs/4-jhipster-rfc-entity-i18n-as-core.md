# JHipster-RFC-4: Entities and I18n as a core features.

<!-- This is a RFC template based on the Rust RFC process but simplified: https://github.com/rust-lang/rfcs/ -->

- Feature Name: Entities and I18n as a core features.
- Start Date: 2022-01-05
- Issue: [jhipster/generator-jhipster#0000](https://github.com/jhipster/generator-jhipster/0000)

## Summary

[summary]: #summary

This RFC proposes to implement entities and i18n as JHipster core features instead of generators.

## Motivation

[motivation]: #motivation

With JHipster 8 modular proposal, entity and i18n related generators would multiply and become a development problem due to generator dependencies order.

Basically undoable. A solution for this issue must be implemented.

## Guide-level explanation

[guide-level-explanation]: #guide-level-explanation

JHipster v7 has a few generators related to entities, including:

- `entities` generator is used to delegate selected entities to `entity` generator and `database-changelog` generator.
- `entities-client` generator is used to rebuild webpack when some entity changes.
- `entity` generator is used for prompting, configuring, preparing.
- `entity-client` generator is used for entity customizations and writing files related to client.
- `entity-i18n` generator is used for entity customizations and writing files related to i18n.
- `entity-server` generator is used for entity customizations and writing files related to server.

At JHipster v8 `entity-client` would be split to `entity-client`, `entity-angular`, `entity-react`, `entity-vue`, `entity-cypress`.
And `entity-server` would be split to `entity-spring-boot`, `entity-spring-boot-sql`, `entity-mongodb`, and so one.

At v7 we have some priorities to be used exclusively at entity generators.

- `preparingFields`
- `preparingRelationships`

Those generators and priorities will be replaced by entity/i18n focused priorities and internal methods to support the workflow. Some entity related generators may be kept for more specific purpose like prompts.

Planed priorities includes:

- `configuringEachEntity`: priority to manipulate entities config.
- `preparingEachEntity`: priority to create derived properties for entities to be used by the templates.
- `preparingEachEntityField`: priority to create derived properties for fields to be used by the templates.
- `preparingEachEntityRelationship`: priority to create derived properties for relationships to be used by the templates.
- `writingEachEntity`: priority to write entity related files.
- `writingEachLanguage`: priority to write language related files.
- `writingEachEntityLanguage`: priority to write entity related i18n files.

## Reference-level explanation

[reference-level-explanation]: #reference-level-explanation

New priorities will have as first argument relevant resources to the priority/task purpose.

```js
  get configuringEachEntity () {
    return {
      configuringEntityTask({ application, entityStorage, entityConfig }) {
        entityConfig.dto = true;
      }
    }
  }

  get preparingEachEntity () {
    return {
      preparingEntityTask({ application, entity }) {
        if (entity.dto) {
          entityConfig.dtoName = `${entity.entityName}DTO`;
        }
      }
    }
  }

  get preparingEachEntityField () {
    return {
      preparingEntityFieldTask({ application, entity, field }) {
        field.getter = `get${field.fieldName}`;
      }
    }
  }

  get preparingEachEntityRelationship () {
    return {
      preparingEntityRelationshipTask({ application, entity, relationship }) {
        relationship.getter = `get${relationship.relationshipName}`;
      }
    }
  }

  get writingEachEntity () {
    return {
      async writeEntityTask({ application, entity }) {
        await this.writeFileToDisk(entityFiles, { application, entity });
      }
    }
  }

  get writingEachLanguage () {
    return {
      async writeLanguageTask({ application, language }) {
        await this.writeFileToDisk(translationFiles, { application, language });
      }
    }
  }

  get writingEachEntityLanguage () {
    return {
      async writeLanguageTask({ application, entity, language }) {
        await this.writeFileToDisk(entityTranslationFiles, { application, entity, language });
      }
    }
  }
```

## Drawbacks

[drawbacks]: #drawbacks

?

## Rationale and alternatives

[rationale-and-alternatives]: #rationale-and-alternatives

As advantages we can list:

- Fewer generators.
- Remove lots of duplicated codes from entity related generators.

## Unresolved questions

[unresolved-questions]: #unresolved-questions

- A more granular implementation is required? `configuringEachEntityField`, others?

## Implementation

New priorities will be implemented at v7 as a incremental feature. Entity/i18n breaking change implementation will only be migrated to the new priorities at v8 pre-release cycle.
