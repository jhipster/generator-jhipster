# JHipster architecture

## Yeoman basis

Internally, JHipster uses [Yeoman](https://yeoman.io) as the core. JHipster is the [most popular generator of all time](https://yeoman.io/generators/).

## File structure

- `.blueprint` - development blueprint, used to generate and manage samples
- `.devcontainer` - vscode's devcontainer definitions
- `.github` - github configuration
- `.vscode` - vscode's configuration
- `bin` - jit executable and helper
- `cli` - (exported) cli implementation
- `generators/*` - (exported) generators
  - `command.ts` - cli options, cli arguments definitions
  - `generator.ts` - generator implementation
  - `index.ts` - generator exports. Must re-export generator as default export and the command
  - `internal` - non-exported supporting libs
  - `resources` - supporting resources
  - `jdl` - generator's jdl specifications
  - `support` - (exported) exported supporting libs
  - `templates` - templates folder
- `lib` - (exported) shared libraries, utilities, types and jdl parser
- `rfcs` - [RFCs](CONTRIBUTING.md#rfcs)
- `test` - package tests

## Lifecycle

- [CLI entry point](https://github.com/jhipster/generator-jhipster/blob/main/cli/jhipster.cjs)
- [Basic environment validation](https://github.com/jhipster/generator-jhipster/blob/main/cli/cli.ts)
- [Cli arguments parsing and Environment bootstrap](https://github.com/jhipster/generator-jhipster/blob/main/cli/program.ts)
  - Lookup for generators and blueprints
  - Build CLI options and arguments definition
  - Parse options and arguments
- Run Generator (start the Environment) passing options and arguments
- Run every task from the highest precedence priority until there is no more pending task

### Priorities

#### Initializing (yeoman)

Initial generator information.

- say generator specific hello
- initial environment checks
- argument and options loading

```ts
get [Generator.INITIALIZING]() {
  return this.asInitializingTaskGroup() {
    sayHelloTask() {
      this.log.info('Welcome to your generator');
    },
    envChecks() {
      checkNode();
      checkDocker();
    },
    async loadOptions() {
      this.parseJHipsterArguments(command.arguments);
      this.parseJHipsterConfigs(command.configs);
    },
  }
}
```

#### Prompting (yeoman)

Prompt for configuration.

```ts
get [Generator.PROMPTING]() {
  return this.asPromptingTaskGroup() {
    async prompting() {
      await this.prompt(this.prepareQuestions(command.configs));
    },
  }
}
```

#### Configuring (yeoman)

Check and fix configurations:

```ts
get [Generator.CONFIGURING]() {
  return this.asConfiguringTaskGroup() {
    checkConfig() {
      if (this.jhipsterConfigWithDefaults.reactive && this.jhipsterConfigWithDefaults.cacheProvider !== 'no') {
        this.log.warn("Reactive applications doesn't support cache. Disabling");
        this.jhipsterConfig.cacheProvider = 'no';
      }
    },
  }
}
```

#### Composing (base)

Compose with other generators:

```ts
get [Generator.COMPOSING]() {
  return this.asComposingTaskGroup() {
    async composing() {
      if (this.jhipsterConfigWithDefaults.clientFramework === 'angular') {
        await this.composeWithJHipster('angular');
      }
    },
  }
}
```

#### Loading (base)

Load configuration:

```ts
get [Generator.LOADING]() {
  return this.asLoadingTaskGroup() {
    loading({ application }) {
      application.myCustomConfig = this.jhipsterConfig.myCustomConfig;
      application.myBlueprintCustomConfig = this.blueprintConfig.myBlueprintCustomConfig;
    },
  }
}
```

#### Preparing (base)

Generate properties to improve understanding:

```ts
get [Generator.PREPARING]() {
  return this.asPreparingTaskGroup() {
    preparing({ application }) {
      application.myCustomConfigFoo = this.jhipsterConfig.myCustomConfig === 'foo';
      application.myCustomConfigBar = this.jhipsterConfig.myCustomConfig === 'bar';
      application.myCustomConfigNo = !this.jhipsterConfig.myCustomConfig || this.jhipsterConfig.myCustomConfig === 'no';
    },
  }
}
```

#### Custom objects (base-core)

A generator declares its own objects with the `customObjects` feature, a list of objects (`{ name, before }`), and
implements a getter of each name giving an array of the objects. Each object gets three priorities before its `before`
priority (the post preparing one by default, so after the preparing priority), in the order the objects are declared,
each with the array of the objects (`service`):

- `loading<Name>`: its tasks load the objects;
- `preparing<Name>`: its tasks prepare them;
- `postPreparing<Name>`: its tasks use the prepared objects.

The objects are written in two priorities of their own, with every custom object of the generator by name:
`writingObjects` (`Generator.WRITING_OBJECTS`), after the writing priority and before the post writing one, and
`postWritingObjects` (`Generator.POST_WRITING_OBJECTS`), after the post writing priority, with the `source` too. A
generator declaring the names of its custom objects as the `customObjectNames` type gets them typed, with the type of
their getters, through `asWritingObjectsTaskGroup` and `asPostWritingObjectsTaskGroup`.

To share the objects with the other generators declaring them, the getter reads them from the context
(`getContextData`), and each phase runs for every generator before the next one. While the objects are prepared, a
default (`mutateData`) reading a property not yet set waits for it, and is applied before the post preparing, like the
application ones. An application generator gives the phases the `application`, and they run before its entity priorities. A workspaces generator runs
them after its workspaces priorities, before the default priority, and gives them the `deployment` and its
`applications`. `Generator.objectPriority(name, phase)` gives the priority of a phase:

```ts
export default class extends Generator {
  constructor(args, options, features) {
    super(args, options, { ...features, customObjects: [{ name: 'service' }] });
  }

  get service() {
    return this.getContextData('my-blueprint:service', { factory: () => [{}] });
  }

  get [Generator.objectPriority('service', 'loading')]() {
    return {
      loading({ service: [service] }) {
        service.name = 'Book';
      },
    };
  }

  get [Generator.objectPriority('service', 'preparing')]() {
    return {
      preparing({ service }) {
        for (const each of service) {
          each.className = `${each.name}Service`;
        }
      },
    };
  }

  // The names of the custom objects, for the writing objects tasks to get them typed.
  declare readonly customObjectNames: readonly ['service'];

  get [Generator.WRITING_OBJECTS]() {
    return this.asWritingObjectsTaskGroup({
      async writeServices({ application, service }) {
        for (const each of service) {
          await this.writeFiles({ sections: serviceFiles, context: { ...application, service: each } });
        }
      },
    });
  }
}
```

#### Objects of the application (base-application)

The `objects` of the `.yo-rc.json` file declare the objects of an application by name, out of the `generator-jhipster`
key: each with its `type`, `documentation`, `annotations` and `fields`, a field with its `type`, `documentation`,
`validations` and `annotations`. A type is a type of the JDL or an enum, a reference to an entity
(`{ "$ref": ".jhipster/Order.json" }`) or to an object (`{ "$ref": "#/objects/Quote" }`), or an array of the type of its
items:

- `getObjectConfig(name)` gives the configuration of an object as declared;
- `getObject(name)` gives the object, with its `name`, and the objects and the entities it references embedded in place of
  their reference, each the same instance wherever it is referenced, an entity the one the application prepares; a
  reference with other fields (`{ "$ref": "#/objects/Quote", "documentation": "..." }`) gives a copy of the referenced
  one with the fields merged over it, the objects and the entities it references kept;
- `findObjects(type)` gives the objects of a type, sorted by name.

The type of an object is the name of the custom object handling it: its getter gives `findObjects(<name>)`, and its
`before` priority is the default one, the entities being prepared by then:

```ts
export default class extends BaseApplicationGenerator {
  constructor(args, options, features) {
    super(args, options, { ...features, customObjects: [{ name: 'service', before: 'default' }] });
  }

  get service() {
    return this.findObjects('service');
  }
}
```

#### Configuring each entity (base-application)

Configure and check entity's configuration:

```ts
get [Generator.CONFIGURING_EACH_ENTITY]() {
  return this.asConfiguringEachEntityTaskGroup() {
    configuring({ application, entityConfig }) {
      if (application.searchEngineNo && entityConfig.searchEngine && entityConfig.searchEngine !== 'no') {
        this.log.warn("Search engine cannot be enabled at entity because it's disabled at application");
        entityConfig.searchEngine = 'no';
      }
    },
  }
}
```

#### Loading entities (base-application)

Usually empty the entire entity configuration is loaded by default.

#### Preparing each entity (base-application)

Generate properties to improve understanding at the entity level:

```ts
get [Generator.PREPARING_EACH_ENTITY]() {
  return this.asPreparingEachEntityTaskGroup() {
    preparing({ application, entity }) {
      entity.dtoMapstruct = entity.dto === 'mapstruct';
    },
  }
}
```

#### Preparing each entity field (base-application)

Generate properties to improve understanding at the field level:

```ts
get [Generator.PREPARING_EACH_ENTITY_FIELD]() {
  return this.asPreparingEachEntityFieldTaskGroup() {
    preparing({ application, entity, field }) {
      field.technologyFieldTypeIntegerMap = field.fieldType === 'Integer';
    },
  }
}
```

#### Preparing each entity relationship (base-application)

Generate properties to improve understanding at the relationship level:

```ts
get [Generator.PREPARING_EACH_ENTITY_RELATIONSHIP]() {
  return this.asPreparingEachEntityRelationshipTaskGroup() {
    preparing({ application, entity, relationship }) {
      relationship.technologyRelationshipDbName = relationship.relationshipTypeOneToOne ? 'foo' : 'bar';
    },
  };
}
```

#### Default (yeoman)

Generate properties to improve understanding that depends on others' properties:

```ts
get [Generator.DEFAULT]() {
  return this.asDefaultTaskGroup() {
    preparing({ application, entities }) {
      application.hasEntityFieldInteger = entities.some(entity => entity.fields.some(field => field.fieldTypeInteger));
    },
  };
}
```

#### Writing (yeoman)

Write files to the in-memory file system.

There are a lot of APIs to write files, copy files, and delete files.
The `writeFiles()` method is the most used in official generators.

```ts
get [Generator.WRITING]() {
  return this.asWritingTaskGroup({
    async writingTask({ application }) {
      await this.writeFiles({
        blocks: [
          {
            condition: ctx => ctx.shouldWrite,
            templates: ['template.file'],
          }
        ],
        context: application,
      });
    },
  });
}
```

#### Writing entities (base-application)

Write entity files to the in-memory file system.

Writing entities is a separate priority to keep the workflow sane when using options like `--skip-application` and `--single-entity`.

```ts
get [Generator.WRITING_ENTITIES]() {
  return this.asWritingTaskGroup({
    async writingTask({ application, entities }) {
      for (const entity of entities) {
        await this.writeFiles({
          blocks: [
            {
              condition: ctx => ctx.shouldWrite,
              templates: ['entity.template.file'],
            }
          ],
          context: { ...application, ...entity },
        });
      }
    },
  });
}
```

#### Post writing (base)

Injects code in the generated source.

##### Injecting code with provided apis (needles)

JHipster adds APIs for code injection:

```ts
get [Generator.POST_WRITING]() {
  return this.asPostWritingTaskGroup({
    postWritingTask({ source }) {
      source.someProvidedInjectionApi({ code: 'some code' });
    }
  });
}
```

##### Custom code injection

Every file can be edited manually.

```ts
get [Generator.POST_WRITING]() {
  return this.asPostWritingTaskGroup({
    postWritingTask({ source }) {
      this.editFile('path/to/some/file', content => content.replaceAll('some content', 'another content'));
    }
  });
}
```

#### Install (yeoman)

Usually empty.
Install task is queued by detecting `package.json` changes.

#### End (yeoman)

Print generator result and info:

```ts
get [Generator.END]() {
  return this.asEndTaskGroup() {
    preparing({ application }) {
      this.log.success('Tech application generated successfully');
      this.log.log(`Start the application running 'npm run start:app'`);
    },
  };
}
```

## Blueprints

Blueprint support allows customizing the generation process.

A Blueprint package can include any number of sub-generators, each can be a replacement blueprint, a side-by-side blueprint, or a stand alone blueprint.

- Normal blueprints will completely replace the blueprinted sub-generator with a replacement.
- Side by side blueprint doesn't change the generation process, it customizes it.
- Stand alone blueprint doesn't hook into a sub-generator.

Examples:

- [Micronaut](https://github.com/jhipster/generator-jhipster-micronaut) has a [server](https://github.com/jhipster/generator-jhipster-micronaut/tree/0818dd9d90f4a550e008133adc7fad6b17089caa/generators/server) replacement blueprint, an [angular](https://github.com/jhipster/generator-jhipster-micronaut/tree/0818dd9d90f4a550e008133adc7fad6b17089caa/generators/angular), [client](https://github.com/jhipster/generator-jhipster-micronaut/tree/0818dd9d90f4a550e008133adc7fad6b17089caa/generators/client), [cypress](https://github.com/jhipster/generator-jhipster-micronaut/tree/0818dd9d90f4a550e008133adc7fad6b17089caa/generators/cypress), [docker](https://github.com/jhipster/generator-jhipster-micronaut/tree/0818dd9d90f4a550e008133adc7fad6b17089caa/generators/docker) and [react](https://github.com/jhipster/generator-jhipster-micronaut/tree/0818dd9d90f4a550e008133adc7fad6b17089caa/generators/react) side by side blueprints, and a [micronaut-cache](https://github.com/jhipster/generator-jhipster-micronaut/tree/0818dd9d90f4a550e008133adc7fad6b17089caa/generators/micronaut-cache) stand alone blueprint

More information can be found at:

- [Extending and customizing](https://www.jhipster.tech/modules/extending-and-customizing/)
- [Creating a stand alone Blueprint](https://www.jhipster.tech/modules/creating-a-module/)
- [Creating a blueprint](https://www.jhipster.tech/modules/creating-a-blueprint/)

### Blueprint scope

A blueprint belongs to the project whose `.yo-rc.json` stores it ([RFC-7](rfcs/7-jhipster-rfc-blueprint-scope.md)):

- `--blueprints` applies to the project the command runs in, `--global-blueprints` to every project the run generates, the ones in other folders included.
- A generator composed in another folder (`composeWithJHipster` with a `destinationRoot`) uses the blueprints of the `.yo-rc.json` of that folder, unless they are passed to it.
- The `jdl` generator is not blueprinted: the applications of a jdl use the blueprints their jdl declares.

### Blueprint lifecycle

#### Replacement blueprint

| Priority     | Blueprinted sub-gen                   | Blueprint sub-gen              |
| ------------ | ------------------------------------- | ------------------------------ |
| beforeQueue  | composes with blueprints/dependencies | composes with dependencies     |
| initializing | X                                     | replacement initializing tasks |
| prompting    | X                                     | replacement prompting tasks    |
| ...          | X                                     | ...                            |

#### Side by side blueprint

| Priority     | Blueprinted sub-gen                   | Blueprint sub-gen             | Another blueprint sub-gen     |
| ------------ | ------------------------------------- | ----------------------------- | ----------------------------- |
| beforeQueue  | composes with blueprints/dependencies | composes with dependencies    | composes with dependencies    |
| initializing | initializing tasks                    | additional initializing tasks | additional initializing tasks |
| prompting    | prompting tasks                       | additional prompting tasks    | additional prompting tasks    |
| ...          | ...                                   | ...                           | ...                           |

#### Stand alone blueprint

| Priority     | Blueprint sub-gen          |
| ------------ | -------------------------- |
| beforeQueue  | composes with dependencies |
| initializing | initializing tasks         |
| prompting    | prompting tasks            |
| ...          | ...                        |

## Generator Hierarchy

### GeneratorBaseCore

Adds custom APIs to `yeoman-generator` and customizes the behavior.

### GeneratorBase

Adds Blueprint composing APIs.

### GeneratorApplication

Adds Entities related apis.
