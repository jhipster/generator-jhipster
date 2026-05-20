# JHipster-RFC-6: jhipster generator file structure

<!-- This is a RFC template based on the Rust RFC process but simplified: https://github.com/rust-lang/rfcs/ -->

- Feature Name:jhipster_generator_file_structure
- Start Date: 2025-07-26
- Issue: [jhipster/generator-jhipster#30187](https://github.com/jhipster/generator-jhipster/issues/30187)

## Summary

[summary]: #summary

The goal of this RFC is to describe the generator conventions and file structure for the JHipster generator that enhances modularity, maintainability, and ease of use. The new structure will allow for better organization of files and directories, making it easier for developers to navigate and contribute to the project.

## Motivation

[motivation]: #motivation

Improving the file structure of the JHipster generator is essential for several reasons:

- **Modularity**: A well-defined structure allows for better modularization of the generator, making it easier to add, remove, or update features without affecting the entire codebase.
- **Maintainability**: A clear and consistent file structure makes it easier for developers to understand the codebase, locate files, and make changes. This is especially important for new contributors who may find the current structure confusing.
- **Ease of Use**: A more intuitive file structure can improve the developer experience, making it easier to find and use the generator's features. This can lead to increased adoption and contribution from the community.
- **Scalability**: As the generator grows and evolves, a well-organized file structure will help manage complexity and ensure that the codebase remains manageable.
- **Consistency**: Establishing conventions for file organization will lead to a more consistent codebase, making it easier for developers to follow best practices and contribute effectively.
- **Extensibility**: A modular file structure will facilitate the addition of new features and technologies, allowing the generator to adapt to changing requirements and trends in the software development landscape. Also to support leverage and ease the maintainance of third party blueprint providers in the long term.

## Guide-level explanation

[guide-level-explanation]: #guide-level-explanation

This RFC description will be split into multiple parts:

1. **Blueprint/Generators convention Overview**: will explain the different kind of generators and their purpose.
2. **Package and file Structure**: will describe the proposed file structure for each kind of generator.
3. Inheritance and Composition: will explain how the inheritance and composition of generators will work.
4. Methods and Functions: will detail the methods and functions that should be implemented in each file type.

### Blueprint/Generators convention Overview

[blueprint-generators-convention-overview]: #blueprint-generators-convention-overview

The JHipster generator will be organized into several types of generators, each serving a specific purpose. The main types of generators are:

- **Base Generators**: These are the core generators that provide the basic functionality of the downstream JHipster generator in the inheritance chain. This includes:
  <!-- prettier-ignore -->
  - Tasks and Priorities 
  <!-- prettier-ignore -->
  - Contexts and object injection in functions (application, entities, etc.)
  <!-- prettier-ignore -->
  - Facade of useful methods and functions (writing, propmting, etc.)
- **Feature Generators**: These generators add specific features or functionalities of jhipster (cucumber, kubernetes, ...). They can be used to extend the capabilities of the base generator by extending its core functionality.
- **Bootstrap Generators**: These generators are used to bootstrap the Features generators by executing common tasks that are common to many of them.

## Reference-level explanation

[reference-level-explanation]: #reference-level-explanation

### Generators inheritance and composition

[generators-inheritance-and-composition]: #generators-inheritance-and-composition

Here is the proposed inheritance and composition possibility for the JHipster generator depending on their kind

![Inheritance and composition diagram](./assets/rfc6-generators-inheritance-and-composition.jpg 'Inheritance and composition diagram')

### Package and file structure

[package-and-file-structure]: #package-and-file-structure

#### Base Generators

[base-generators]: #base-generators

The base generators will be organized into a specific package structure to ensure clarity and maintainability. The proposed structure is as follows:

```generator-jhipster/
├── generators/
│   ├── base-<name>/
│   │   ├── tasks.d.ts // optional
│   │   ├── types-mutations.ts // optional
│   │   ├── api.d.ts // optional
│   │   ├── index.ts
│   │   ├── generator.ts
│   │   ├── internal/ // optional
│   │   │   ├── <any-internal-helper>.ts
│   │   ├── support/ // optional
│   │   │   ├── <any-helper>.ts
```

This structure allows for a clear separation of concerns, with each base generator having its own directory containing its tasks, types, and internal support files. The `internal` directory is used for helper functions that are not intended to be used outside the base generator, while the `support` directory contains utility functions that can be reused across different base generators.

**tasks.d.ts**: This file defines the tasks that the base generator will declare. It includes the task names, descriptions, and any parameters required for each task as well as their orders and injected parameters.

**types-mutations.ts**: This file defines the types and the mutation (from empty to fully hydrated object) used by the base generator, including any interfaces or type aliases that are specific to the base generator (Workspace, Application, Entities, Source template metadata, etc.). **RULE**: Types shouldn't contain any fields that are not directly related to the generator's functionality. They should be used to define the structure of the data that the base generator will work with, such as the application configuration or entity definitions. They can extend types from an upstream generator, and should not contain any business logic or methods.

**api.d.ts**: This file defines the public API of the base generator, including any methods or properties that should be accessible to other generators. It serves as a contract for the base generator's functionality.

**index.ts**: This file serves as the entry point for the base generator, exporting the main functionality and any public methods or classes that should be accessible to other generators. Usually exposes the generator class, api, types and tasks.

**generator.ts**: This file contains the main generator class that extends the JHipster base generator class.
It should contains:

- Facade of support methods and functions that can be used by the downstream generator (`write() {return import {'./support/write.ts'}.writeFile}`).
- Loading of contextual objects (application, entities, etc.) and their injection in the priorities methods.

##### PROs

- Clear separation of concerns, making it easier to understand and maintain the codebase.
- Modular structure allows for easy addition or removal of features without affecting the entire codebase.
- Consistent naming conventions and file organization improve readability and developer experience.
- Allow sibling feature generators (not part of the inheritance chain) to access the base generator's support methods and functions.

#### Feature Generators file structure

[feature-generators-file-structure]: #feature-generators-file-structure

Feature generators will be organized in a similar way to base generators, but with a focus on adding specific features or functionalities. The proposed structure is as follows:

```generator-jhipster/
├── generators/
│   ├── <name>/
│   │   ├── commands.d.ts // optional
│   │   ├── types-mutations.ts // optional
│   │   ├── index.ts
│   │   ├── generator.ts
│   │   ├── files.ts // optional
│   │   ├── internal/ // optional
│   │   │   ├── <any-internal-helper>.ts
│   │   ├── support/ // optional
│   │   │   ├── <any-helper>.ts
│   │   ├── resources/ // optional
│   │   │   ├── <any-resource>.<ext>
│   │   ├── templates/ // optional
│   │   │   ├── <any-template>.ts
```

This structure allows for a clear organization of feature-specific files, with each feature generator having its own directory containing its cli commands, types, and internal support files. The `resources` directory is used for any static resources required by the feature generator, such as templates or configuration files.

**commands.d.ts**: This file defines the CLI commands that the feature generator will provide. It includes the command names, descriptions, configuration storage, and any parameters required for each command.

**files.ts**: This file contains the file templates and their associated metadata that the feature generator will use to generate files in the target application. It includes the file names, templates, and any parameters required for each file. **RULE**: the list of file to generate should have contextual information (application, entities, etc.) injected in the file data and never use the generator as a context.

**resources/**: This directory contains any static resources required by the feature generator, such as configuration files, images, or other assets. These resources can be used by the generator during the generation process.

**templates/**: This directory contains any templates used by the feature generator to generate files in the target application. These templates can be used to create files with specific content or structure based on the feature being added.

**generator.ts**: This file contains the main generator class that extends the JHipster base generator class. The difference with the base generator is that:

- It additionally contains the phase methods that will be executed in the generation process (i.e. `preparing`, `writing`, `post-processing`).
- It does not need to load the contextual objects (application, entities, etc.) as they are already loaded by the base generator.
- It can use the upstream base and feature generator's support methods and functions directly (i.e. `this.write()`) without the need to call `support/anysupport`. This will ease the refactoring of the `support`and `mutation` files, methods and functions in the future because it will not be necessary to change the import paths in the downstream feature generators.

##### PROs

- Clear organization of feature-specific files, making it easier to understand and maintain the codebase.
- Modular structure allows for easy addition or removal of features without affecting the entire codebase.
- Consistent naming conventions and file organization improve readability and developer experience.
- Allows for better organization of CLI commands, file templates, and mutation files, making it easier to manage the generation process.
- Provides a clear separation between static resources and templates, making it easier to manage and update them independently.
- Allows sibling feature generators (not part of the inheritance chain) to access the base generator's support methods or to reuse part of the mutations without the need to extend.

## Drawbacks

[drawbacks]: #drawbacks

It includes a lot of changes to the current file structure and conventions, which may require significant effort to implement and migrate existing generators. It will lead to some refactoring in blueprints extending the V8 core generator and willing to upgrade. Hopefully, the amount of reuse of core business logic by these contributions will be much higher, which will lower their maintenance cost (and potential bugs) in the long run.

## Unresolved questions

[unresolved-questions]: #unresolved-questions

The fine grained implementation details of each file as not been discussed yet, such as:

- The amount and granularity of methods in the mutate (by file, by component, etc.) and support files.

- The other packages outside generators: cli, jdl, tests, etc. will not be changed by this RFC. They will remain as they are for now, but the new file structure will allow for easier integration of these packages in the future.
