# Using and contributing to the angular-2 branch

## <a name="setup"></a> Generator development setup
JHipster is a [Yeoman Generator](http://yeoman.io/), so you must follow the [Yeoman authoring documentation](http://yeoman.io/authoring/) in order to be able to run and test your changes.

Make sure you have installed Java8, Git, NodeJS, NPM and YO else follow the 'Local installation' steps detailed [here](https://jhipster.github.io/installation/)

Here are the most important steps.

### Fork the generator-jhipster project and checkout the  master branch

Go to the [generator-jhipster project](https://github.com/jhipster/generator-jhipster) and click on the "fork" button. You can then clone your own fork of the project, and start working on it.

[Please read the Github forking documentation for more information](https://help.github.com/articles/fork-a-repo)

Now do
```
git clone -b master --single-branch https://github.com/jhipster/generator-jhipster.git
```

### Set NPM to use the cloned project

Now `cd` In to your cloned `generator-jhipster` project directory. Make sure you are in the `master` branch, type `npm link`.

This will do a symbolic link from the global `node_modules` version to point to this folder, so when we run `yo jhipster`, you will now use the development version of JHipster.

For testing, you will want to generate an application, and there is a specific issue here: for each application, JHipster installs a local version of itself. This is made to enable several applications to each use a specific JHipster version (application A uses JHipster 3.1.0, and application B uses JHipster 3.2.0).

To overcome this you need to run `npm link generator-jhipster` on the generated project folder as well, so that the local version has a symbolic link to the development version of JHipster.

To put it in a nutshell, you need to:

1. run `npm link` on the `generator-jhipster` project
2. run `npm link generator-jhipster` on the generated application folder (you need to do this for each application you create)

Now, running the 'yo jhipster' command should use your specific JHipster version. You can test it by making a small change in your cloned generator, and running again on an existing JHipster project:

```shell
yo jhipster
```

You should see your changes reflected in the generated project.

### Generate an Angular 2 application

Create a new directory and `cd` into it. Now run
```
yo jhipster
```
Now for the question `Which *Framework* would you like to use for the client?` choose `[BETA] Angular 2.x`

Answer all other questions appropriately. Please note that since this is a WIP some options might not work. If you are unsure use the default options.

Now you would have a spring boot application with a hybrid Angular 2 front end.

Now to have a proper developer experience do as below.

Open a new terminal on this folder and run `./mvnw` or `./gradlew` based on the build tool you choose. Leave this window open.

Now open another terminal on this folder and run `npm run webpack:dev` this will start a development server with live reload and live compile of Typescript.

Now open [http://localhost:9000/](http://localhost:9000/)

### Use a text editor

As modifying the JHipster generator includes modifying Java and JavaScript templates, most IDE will not work correctly. We recommend you use a text editor like [Atom](https://atom.io/) to code your changes.

For the generated app use an IDE with Typescript support or [Visual studio code](https://code.visualstudio.com) (It has great typescript support)

## <a name="rules"></a> Coding Rules
To ensure consistency throughout the source code, keep these rules in mind as you are working to contribute back to the generator:

* All features or bug fixes **must be tested** by one or more tests.
* All files must follow the [.editorconfig file](http://editorconfig.org/) located at the root of the JHipster generator project. Please note that generated projects use the same `.editorconfig` file, so that both the generator and the generated projects share the same configuration.
* Java files **must be** formatted using [Intellij IDEA's code style](http://confluence.jetbrains.com/display/IntelliJIDEA/Code+Style+and+Formatting). Please note that JHipster commiters have a free Intellij IDEA Ultimate Edition for developing the project.
* Generators JavaScript files **must follow** the eslint configuration defined at the project root, which is based on [Airbnb JavaScript Style Guide](https://github.com/airbnb/javascript).
* Generators TypeScript files **must follow** the tslint configuration defined at the project root.
* Web apps JavaScript files **must follow** [Google's JavaScript Style Guide](https://google-styleguide.googlecode.com/svn/trunk/javascriptguide.xml).
* AngularJS files **must follow** [John Papa's Angular 1 style guide] (https://github.com/johnpapa/angular-styleguide/blob/master/a1/README.md).
* Angular 2 TypeScript files **must follow** [John Papa's Angular 2 style guide] (https://angular.io/docs/ts/latest/guide/style-guide.html).

Please ensure to run `npm run lint` and `npm test` on the project root before submitting a pull request. You can also run `npm run lint-fix` to fix some of the lint issues automatically.


For more read our [Contribution guidelines](CONTRIBUTING.md)
