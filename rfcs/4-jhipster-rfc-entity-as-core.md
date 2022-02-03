# JHipster-RFC-4: Entities as a core feature.

<!-- This is a RFC template based on the Rust RFC process but simplified: https://github.com/rust-lang/rfcs/ -->

- Feature Name: Entities as a core feature.
- Start Date: 2021-11-20
- Issue: [jhipster/generator-jhipster#0000](https://github.com/jhipster/generator-jhipster/0000)

## Summary

[summary]: #summary

This RFC proposes to implement entities as JHipster core feature instead of generators.

## Motivation

[motivation]: #motivation

With JHipster 8 modular proposal, entity related generators would multiply and become a development problem due to generator dependencies order. Probably inviable. A solution for this issue must be implemented.

Another reason is that JHipster has too many generators, this will allow a more concise workflow.

## Guide-level explanation

[guide-level-explanation]: #guide-level-explanation

JHipster have a few generators related to entities.

- `entities` generator is used to delegate selected entities to `entity` generator and `database-changelog` generator.
- `entities-client` generator is used to rebuild webpack when some entity changes.
- `entity` generator is used for prompting, configuring, preparing.
- `entity-client` generator is used for entity customizations and writing files related to client.
- `entity-server` generator is used for entity customizations and writing files related to server.

We have priorities to be used on entity generators.

- `preparingFields`
- `preparingRelationships`

Those generators and priorities will be replaced by entity focused priorities and internal methods to support the workflow. Some entity related generators may be kept for more specific purpose like prompts.

Planed priorities includes.

- `configuringEachEntity`: priority to manipulate entities config.
- `preparingEachEntity`: priority to create derived properties for entities to be used by the templates.
- `preparingEachEntityField`: priority to create derived properties for fields to be used by the templates.
- `preparingEachEntityRelationship`: priority to create derived properties for relationships to be used by the templates.
- `writingEntities`: priority to write entity related files.

## Reference-level explanation

[reference-level-explanation]: #reference-level-explanation

New priorities will have as first argument relevant resources to the priority/task purpose.

```js
  get configuringEachEntity () {
    return {
      configuringEntityTask({ entityName, entityStorage, entityConfig }) {
        entityConfig.dto = true;
      }
    }
  }

  get preparingEachEntity () {
    return {
      preparingEntityTask({ entityName, entity }) {
        if (entity.dto) {
          entityConfig.dtoName = `${entityName}DTO`;
        }
      }
    }
  }

  get preparingEachEntityField () {
    return {
      preparingEntityFieldTask({ entityName, entity, field }) {
        field.getter = `get${field.fieldName}`;
      }
    }
  }

  get preparingEachEntityRelationship () {
    return {
      preparingEntityRelationshipTask({ entityName, entity, relationship }) {
        relationship.getter = `get${relationship.relationshipName}`;
      }
    }
  }

  get writingEntities () {
    return {
      async writeEntityTask({ entities }) {
        await this.writeFileToDisk({
          sections: entitiesFiles,
          context: { entities },
        );
        await Promise.all(
          entities.map(async entity => {
            await this.writeFiles({
              sections: entityFiles,
              context: { entity },
            });
          })
        );
      }
    }
  }
```

## Drawbacks

[drawbacks]: #drawbacks

?

## Rationale and alternatives

[rationale-and-alternatives]: #rationale-and-alternatives

The implementation will require changes to `yeoman-generator` in order to allow tasks arguments and extract tasks to execute them for more than once (each entity/language).

As advantages we can list:

- Fewer generators.
- Remove some duplicated codes from entity related generators.

## Unresolved questions

[unresolved-questions]: #unresolved-questions

- A more granular implementation is required? `configuringEachEntityField`, others?

## Implementation

New priorities will be implemented at v7 as a incremental feature. Entity breaking change implementation will only be migrated to the new priorities at v8 pre-release cycle.
