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
- [Basic environment validation](https://github.com/jhipster/generator-jhipster/blob/main/cli/cli.mjs)
- [Cli arguments parsing and Environment bootstrap](https://github.com/jhipster/generator-jhipster/blob/main/cli/program.mjs)
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

```
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
        this.parseJHipsterOptions(command.options);
      },
    }
  }
```

#### Prompting (yeoman)

Prompt for configuration.

TODO

#### Configuring (yeoman)

Check and fix configurations:

```
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

```
  get [Generator.COMPOSING]() {
    return this.asComposingTaskGroup() {
      composing() {
        if (this.jhipsterConfigWithDefaults.clientFramework === 'angular') {
          this.composeWithJHipster('angular');
        }
      },
    }
  }
```

#### Loading (base)

Load configuration:

```
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

```
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

```
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

```
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

```
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

```
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

```
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

```
  get [Generator.WRITING]() {
    return this.asWritingTaskGroup({
      writingTask({ application }) {
        this.writeFiles({
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

```
  get [Generator.WRITING_ENTITIES]() {
    return this.asWritingTaskGroup({
      writingTask({ application, entities }) {
        for (const entity of entities) {
          this.writeFiles({
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

JHipster adds APIs to some code injection:

```
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

```
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

```
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

https://www.jhipster.tech/modules/extending-and-customizing/
https://www.jhipster.tech/modules/creating-a-module/
https://www.jhipster.tech/modules/creating-a-blueprint/

### Blueprint lifecycle

## Generator Hierarchy

### GeneratorBaseCore

Adds custom apis to `yeoman-generator` and customizes the behavior.

### GeneratorBase

Adds Blueprint composing apis.

### GeneratorApplication

Adds Entities related apis.

## JDL
