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
  - `command.m[tj]s` - cli options, cli arguments definitions
  - `generator.m[tj]s` - generator implementation
  - `index.m[tj]s` - generator exports. Must re-export generator as default export and the command
  - `internal` - non-exported supporting libs
  - `resources` - supporting resources
  - `jdl` - generator's jdl specifications
  - `support` - (exported) exported supporting libs
  - `templates` - templates folder
- `jdl` - (exported) jdl parser implementation
- `rfcs` - (RFCs)[CONTRIBUTING.md#rfcs]
- `test` - package tests
- `test-integration` - CI related stuff. Samples, scripts.

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

- [Micronaut](https://github.com/jhipster/generator-jhipster-micronaut) has a [server](https://github.com/jhipster/generator-jhipster-micronaut/tree/0818dd9d90f4a550e008133adc7fad6b17089caa/generators/server) replacement blueprint, a [angular](https://github.com/jhipster/generator-jhipster-micronaut/tree/0818dd9d90f4a550e008133adc7fad6b17089caa/generators/angular), [client](https://github.com/jhipster/generator-jhipster-micronaut/tree/0818dd9d90f4a550e008133adc7fad6b17089caa/generators/client), [cypress](https://github.com/jhipster/generator-jhipster-micronaut/tree/0818dd9d90f4a550e008133adc7fad6b17089caa/generators/cypress), [docker](https://github.com/jhipster/generator-jhipster-micronaut/tree/0818dd9d90f4a550e008133adc7fad6b17089caa/generators/docker) and [react](https://github.com/jhipster/generator-jhipster-micronaut/tree/0818dd9d90f4a550e008133adc7fad6b17089caa/generators/react) side by side blueprints, and a [micronaut-cache](https://github.com/jhipster/generator-jhipster-micronaut/tree/0818dd9d90f4a550e008133adc7fad6b17089caa/generators/micronaut-cache) stand alone blueprint

More information can be found at:

[Extending and customizing](https://www.jhipster.tech/modules/extending-and-customizing/)
[Creating a stand alone Blueprint](https://www.jhipster.tech/modules/creating-a-module/)
[Creating a blueprint](https://www.jhipster.tech/modules/creating-a-blueprint/)

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

Adds custom APIS to `yeoman-generator` and customizes the behavior.

### GeneratorBase

Adds Blueprint composing APIS.

### GeneratorApplication

Adds Entities related apis.
