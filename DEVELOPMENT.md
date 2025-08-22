# JHipster development

- [Generator development setup](#setup)

## <a name="setup"></a> Generator development setup

JHipster is a [Yeoman Generator](http://yeoman.io/), so you must follow the [Yeoman authoring documentation](http://yeoman.io/authoring/) in order to be able to run and test your changes.

Here are the most important steps.

### Fork the generator-jhipster project

Go to the [generator-jhipster project](https://github.com/jhipster/generator-jhipster) and click on the "fork" button. You can then clone your own fork of the project, and start working on it.

[Please read the GitHub forking documentation for more information](https://help.github.com/articles/fork-a-repo)

### Set `jhipster` command to use the cloned project

Since v8 `generator-jhipster` is written in TypeScript.
To run it you need to compile to JavaScript or use a just-in-time compilation.

#### Running jit executable

The executable is located at `bin/jhipster.cjs`.
You can alias it to `jhipster` command:

```shell
alias jhipster="GLOBAL_PATH/generator-jhipster/bin/jhipster.cjs"
```

#### Globally linked compiled package

In your cloned `generator-jhipster` project, run `npm ci` and then run `npm link`.

`npm ci` will do a clean installation of all the project dependencies and compile sources.
`npm run build` can be used to compile sources after each change.

`npm link` will make a symbolic link from the global `node_modules` version to point to this folder, so when we run `jhipster`, you will now use the development version of JHipster.

### Test generating applications

For testing, you will want to generate an application, and there is a specific issue here: for each application, JHipster installs a local version of itself. This is made to enable several applications to each use a specific JHipster version (application A uses JHipster 3.1.0, and application B uses JHipster 3.2.0).

To overcome this, you need to run `npm link generator-jhipster` on the generated project folder as well, so that the local version has a symbolic link to the development version of JHipster.
Also add the option `--skip-jhipster-dependencies` to generate the application ignoring the JHipster dependencies (otherwise a released version will be installed each time npm install/ci is called). You can later on re-add the dependency with the command `jhipster --no-skip-jhipster-dependencies`.

To put it in a nutshell, you need to:

1.  Run `npm link` on the `generator-jhipster` project (link globally) or configure jit executable
2.  Run `jhipster --skip-jhipster-dependencies` on the generated application folder

You can execute `jhipster --install-path` to check where JHipster is being executed from.

You can test your setup by making a small change in your cloned generator, and running again on an existing JHipster project:

For projects with JHipster third-party libraries (i.e. react-jhipster, etc.), you need to run `npm link` on the library project as well, then `npm link` the original framework (i.e. react) from the generated project to the library project `cd react-jhipster && npm link <path-to-generated-project>/node_modules/react`.

```shell
jhipster
```

Depending on which parts of the generator you have changed, do not forget to run the `jhipster` command with the proper arguments e.g. when updating the entity template run:

```shell
jhipster --with-entities
```

You should see your changes reflected in the generated project.

Note: The generated project might not build properly in case the generator is using a
snapshot version of [jhipster/jhipster-bom](https://github.com/jhipster/jhipster-bom). This issue is mentioned in; https://github.com/jhipster/generator-jhipster/issues/9571. In
this case, clone the jhipster/jhipster-bom project and build it using:

```shell script
./mvnw clean install -Dgpg.skip=true
```

or on Windows:

```
.\mvnw.cmd clean install -D"gpg.skip=true"
```

### Use a text editor

As modifying the JHipster generator includes modifying Java and JavaScript templates, most IDE will not work correctly. We recommend you use a text editor like [VSCode](https://code.visualstudio.com/) or [IntelliJ IDEA](https://www.jetbrains.com/idea/) to code your changes. The ESLint and EditorConfig extensions are recommended to help with respecting code conventions.

### Use a debugger

It is possible to debug JHipster's code using a Node.js debugger. To achieve this setup your debugger to launch `cli/jhipster.js`.

#### Debugging with VSCode

To start debugging JHipster with **VSCode**, open the generator code in your workspace and simply press F5 (or click the green arrow in the **Debug** menu reachable with Ctrl/Cmd+Shift+D). This will start the generator in debug mode and generate files in the [test-integration/samples/app-sample-dev](test-integration/samples/app-sample-dev) folder.

It is also possible to debug sub generators by selecting one of the other debug options (for example `jhipster entity`). Those debug configurations are specified in the `.vscode/launch.json` file.

## Generator implementation

### important config objects

## Generator tests and snapshots

Run every test with lint/prettier
`npm test`

Run every test without lint/prettier
`npx esmocha`

Update every test snapshot
`npm run update-snapshots`

Run specific tests
`npx esmocha <path>`

Run specific tests in series (improved error reporting)
`npx esmocha <path> --no-parallel`

Update specific test snapshot
`npm run update-snapshot -- <path>` or `npx esmocha <path> --no-parallel --update-snapshot`

Fixing lint and prettier errors
`npm run lint-fix`

## Generating and testing samples

Sample generating is provided by `generator-jhipster` local blueprint which we will refer as `dev blueprint`.
The dev blueprint is enabled by running jhipster in JIT mode (executing `./bin/jhipster.cjs` file relative to this file).

### Generating samples using dev blueprint

`jhipster generate-sample ng-default` will generate the `ng-default` sample at current folder.

#### Daily builds samples

Daily builds samples are prefixed with `daily-`.

#### Samples folder

A common samples folder will be used if `--global` option is used like `jhipster generate-sample ng-default --global`.
At first execution a prompt will ask for the samples folder, the chosen value will be reused at next executions.
At samples folder, a `jhipster-samples.code-workspace` is generated. It provides a single vscode workspace for `generator-jhipster` and samples generated at the samples folder. It's very used for quick looks.

### Testing samples

CI tests use the following commands:

```
npm ci:backend:test
npm ci:frontend:test
npm run ci:e2e:package # Builds the application
npm run ci:e2e:prepare # Starts the application using docker
npm run ci:e2e:run # Runs e2e tests
```

## DX using vscode

`generator-jhipster` add a series of vscode configurations for a better developer experience.

### Development Containers

A container is built using Java, Node, and npm as recommended by `generator-jhipster`.
Once up, you should have the stack maintainers recommends.

### Execution shortcuts

Shortcuts are provided to easily generate integration tests samples.

- go to `Execute and Debug`.
- select the sample's GitHub workflow.
- run the shortcut.
- select the sample.
- sample is generated at `../jhipster-samples/` folder relative the `generator-jhipster` folder.

Some daily builds samples are available too.

### Generators tests

At test tab you can run and debug individual test.

## <a name="templates"></a> Template Guidelines

The template engine used by yeoman is [EJS](http://ejs.co/), its syntax is fairly simple.
For simple code (few lines), logic can be embedded in the main file but if logic becomes more complex it's better to externalise the JS fragment to a sub template included by the first one and located in same folder.

Sub templates should be named with the `ejs` extension because it's the default one, it enables editors to apply correct syntax highlighting and it enables us to use a very concise syntax:

    <%- include('../common/field_validators', {field, reactive}); -%>

This statement means that [_PersistClass_.java.jhi.jakarta_validation.ejs](generators/java/generators/domain/templates/src/main/java/_package_/_entityPackage_/domain/_persistClass_.java.jhi.jakarta_validation.ejs) template includes [field_validators.ejs](generators/java/generators/domain/templates/_global_partials_entity_/field_validators.ejs) sub template.

Sub templates can be unit tested.
