# Contributing to JHipster

Are you ready to contribute to JHipster? We'd love to have you on board, and we will help you as much as we can. Here are the guidelines we'd like you to follow so that we can be of more help:

 - [Issues and Bugs](#issue)
 - [Feature Requests](#feature)
 - [Submission Guidelines](#submit)
 - [Generator development setup](#setup)
 - [Coding Rules](#rules)
 - [Git Commit Guidelines](#commit)

## <a name="issue"></a> Issues and Bugs
If you find a bug in the source code or a mistake in the documentation, you can help us by submitting a ticket to our [GitHub  issues](https://github.com/jhipster/generator-jhipster/issues). Even better, you can submit a Pull Request to our [JHipster generator project](https://github.com/jhipster/generator-jhipster) or to our [Documentation project](https://github.com/jhipster/jhipster.github.io).

**Please see the Submission Guidelines below**.

## <a name="feature"></a> Feature Requests
You can request a new feature by submitting a ticket to our [GitHub issues](https://github.com/jhipster/generator-jhipster/issues). If you
would like to implement a new feature then consider what kind of change it is:

* **Major Changes** that you wish to contribute to the project should be discussed first. Please open a ticket which clearly states that it is a feature request in the title and explain clearly what you want to achieve in the description, and the JHipster team will discuss with you what should be done in that ticket. You can then start working on a Pull Request.
* **Small Changes** can be proposed without any discussion. Open up a ticket which clearly states that it is a feature request in the title. Explain your change in the description, and you can propose a Pull Request straight away.

## <a name="submit"></a> Submission Guidelines

### Submitting an Issue
Before you submit your issue search the archive, maybe your question was already answered.

If your issue appears to be a bug, and hasn't been reported, open a new issue.
Help us to maximize the effort we can spend fixing issues and adding new
features, by not reporting duplicate issues.  Providing the following information will increase the
chances of your issue being dealt with quickly:

* **Overview of the issue** - if an error is being thrown a stack trace helps
* **Motivation for or Use Case** - explain why this is a bug for you
* **JHipster Version(s)** - is it a regression?
* **JHipster configuration, a `.yo-rc.json` file generated in the root folder** - this will help us to replicate the scenario, you can remove the rememberMe key.
* **Entity configuration(s) `entityName.json` files generated in the `.jhipster` directory** - if the error is during an entity creation or associated with a specific entity
* **Browsers and Operating System** - is this a problem with all browsers or only IE8?
* **Reproduce the error** - an unambiguous set of steps to reproduce the error. If you have a JavaScript error, maybe you can provide a live example with
  [JSFiddle](http://jsfiddle.net/)?
* **Related issues** - has a similar issue been reported before?
* **Suggest a Fix** - if you can't fix the bug yourself, perhaps you can point to what might be
  causing the problem (line of code or commit)

Click [here][1] to open a bug issue with a pre-filled template.

Issues opened without any of these info will be **closed** without any explanation.

### Submitting a Pull Request
Before you submit your pull request consider the following guidelines:

* Search [GitHub](https://github.com/jhipster/generator-jhipster/pulls) for an open or closed Pull Request
  that relates to your submission.
* If you want to modify the JHipster generator, read our [Generator development setup](#setup)
* Make your changes in a new git branch

     ```shell
     git checkout -b my-fix-branch master
     ```

* Create your patch, **including appropriate test cases**.
* Follow our [Coding Rules](#rules).
* Generate a new JHipster project, and ensure that all tests pass

     ```shell
     mvn package -Pprod
     ```

* Test that the new project runs correctly:

     ```shell
     mvn spring-boot:run
     ```

* Commit your changes using a descriptive commit message that follows our
  [commit message conventions](#commit-message-format).

     ```shell
     git commit -a
     ```

  Note: the optional commit `-a` command line option will automatically "add" and "rm" edited files.

* Push your branch to GitHub:

    ```shell
    git push origin my-fix-branch
    ```

* In GitHub, send a pull request to `jhipster/generator-jhipster:master`.
* If we suggest changes then
  * Make the required updates.
  * Re-run the JHipster tests on your sample generated project to ensure tests are still passing.
  * Rebase your branch and force push to your GitHub repository (this will update your Pull Request):

    ```shell
    git rebase master -i
    git push -f
    ```

That's it! Thank you for your contribution!

#### Resolving merge conflicts ("This branch has conflicts that must be resolved")

Sometimes your PR will have merge conflicts with the upstream repository's master branch. There are several ways to solve this but if not done correctly this can end up as a true nightmare. So here is one method that works quite well.

* First, fetch the latest information from the master

    ```shell
    git fetch upstream
    ```

* Rebase your branch against the upstream/master

    ```shell
    git rebase upstream/master
    ```

* Git will stop rebasing at the first merge conflict and indicate which file is in conflict. Edit the file, resolve the conflict then

    ```shell
    git add <the file that was in conflict>
    git rebase --continue
    ```

* The rebase will continue up to the next conflict. Repeat the previous step until all files are merged and the rebase ends successfully.
* Re-run the JHipster tests on your sample generated project to ensure tests are still passing.
* Force push to your GitHub repository (this will update your Pull Request)

    ```shell
    git push -f
    ```

#### After your pull request is merged

After your pull request is merged, you can safely delete your branch and pull the changes
from the main (upstream) repository:

* Delete the remote branch on GitHub either through the GitHub web UI or your local shell as follows:

    ```shell
    git push origin --delete my-fix-branch
    ```

* Check out the master branch:

    ```shell
    git checkout master -f
    ```

* Delete the local branch:

    ```shell
    git branch -D my-fix-branch
    ```

* Update your master with the latest upstream version:

    ```shell
    git pull --ff upstream master
    ```

## <a name="setup"></a> Generator development setup
JHipster is a [Yeoman Generator](http://yeoman.io/), so you must follow the [Yeoman authoring documentation](http://yeoman.io/authoring/) in order to be able to run and test your changes.

Here are the most important steps.

### Fork the generator-jhipster project

Go to the [generator-jhipster project](https://github.com/jhipster/generator-jhipster) and click on the "fork" button. You can then clone your own fork of the project, and start working on it.

[Please read the Github forking documentation for more information](https://help.github.com/articles/fork-a-repo)

### Set NPM to use the cloned project

In your cloned project, type:

```shell
npm link
```

Now, running the 'yo jhipster' command should use your specific JHipster version. You can test it by making a small change in your cloned generator, and running again on an existing JHipster project:

```shell
yo jhipster
```

TIP: If this doesn't work, try running `npm link generator-jhipster` in your project. See [this guide](http://justjs.com/posts/npm-link-developing-your-own-npm-modules-without-tears) for more information.

You should see your changes reflected in the JHipster project.

### Use a text editor

As modifying the JHipster generator includes modifying Java and JavaScript templates, most IDE will not work correctly. We recommend you use a text editor like [Atom](https://atom.io/) to code your changes.

## <a name="rules"></a> Coding Rules
To ensure consistency throughout the source code, keep these rules in mind as you are working:

* All features or bug fixes **must be tested** by one or more tests.
* All files must follow the [.editorconfig file](http://editorconfig.org/) located at the root of the JHipster generator project. Please note that generated projects use the same .editorconfig file, so that both the generator and the generated projects share the same configuration.
* Java files **must be** formatted using [Intellij IDEA's code style](http://confluence.jetbrains.com/display/IntelliJIDEA/Code+Style+and+Formatting). Please note that JHipster commiters have a free Intellij IDEA Ultimate Edition for developing the project.
* JavaScript files **must follow** [Google's JavaScript Style Guide](https://google-styleguide.googlecode.com/svn/trunk/javascriptguide.xml).

## <a name="templates"></a> Template Guidelines

The template engine used by yeoman is [EJS](http://ejs.co/), its syntax is fairly simple.
For simple code (few lines), logic can be embedded in the main file but if logic becomes more complex it's better to externalise the JS fragment to a sub template included by the first one and located in same folder.

Sub templates should be named with the `ejs` extension because it's the default one, it enables editors to apply correct syntax highlighting and it enables us to use a very concise syntax:

    <%- include field_validators -%>

This staement means that [_Entity.java](entity/templates/src/main/java/package/domain/_Entity.java) template includes [field_validators.ejs](entity/templates/src/main/java/package/domain/field_validators.ejs) sub template.

Sub templates can be unit tested.

## <a name="commit"></a> Git Commit Guidelines

We have rules over how our git commit messages must be formatted.

### <a name="commit-message-format"></a> Commit Message Format
Each commit message consists of a **header**, a **body** and a **footer**.

```
<header>
<BLANK LINE>
<body>
<BLANK LINE>
<footer>
```

Any line of the commit message cannot be longer 100 characters! This allows the message to be easier
to read on Github as well as in various git tools.

### Header
The Header contains a succinct description of the change:

* use the imperative, present tense: "change" not "changed" nor "changes"
* don't capitalize first letter
* no dot (.) at the end

###Body
If your change is simple, the Body is optional.

Just as in the Header, use the imperative, present tense: "change" not "changed" nor "changes".
The Body should include the motivation for the change and contrast this with previous behavior.

###Footer
The footer is the place to reference GitHub issues that this commit **Closes**.

You **must** use the [Github keywords](https://help.github.com/articles/closing-issues-via-commit-messages) for
automatically closing the issues referenced in your commit.

### Example
For example, here is a good commit message:

```
upgrade to Spring Boot 1.1.7

upgrade the Maven and Gradle builds to use the new Spring Boot 1.1.7,
see http://spring.io/blog/2014/09/26/spring-boot-1-1-7-released

Fix #1234
```

[1]:https://github.com/jhipster/generator-jhipster/issues/new?body=*%20**Overview%20of%20the%20issue**%0A%0A%3C!--%20if%20an%20error%20is%20being%20thrown%20a%20stack%20trace%20helps%20--%3E%0A%0A*%20**Motivation%20for%20or%20Use%20Case**%20%0A%0A%3C!--%20explain%20why%20this%20is%20a%20bug%20for%20you%20--%3E%0A%0A*%20**JHipster%20Version(s)**%20%0A%0A%3C!--%20is%20it%20a%20regression%3F%20--%3E%0A%0A*%20**JHipster%20configuration%2C%20a%20%60.yo-rc.json%60%20file%20generated%20in%20the%20root%20folder**%20%0A%0A%3C!--%20this%20will%20help%20us%20to%20replicate%20the%20scenario%2C%20you%20can%20remove%20the%20rememberMe%20key.%20--%3E%0A%0A*%20**Entity%20configuration(s)%20%60entityName.json%60%20files%20generated%20in%20the%20%60.jhipster%60%20directory**%20%0A%0A%3C!--%20-%20if%20the%20error%20is%20during%20an%20entity%20creation%20or%20associated%20with%20a%20specific%20entity%20--%3E%0A%0A*%20**Browsers%20and%20Operating%20System**%20%0A%0A%3C!--%20is%20this%20a%20problem%20with%20all%20browsers%20or%20only%20IE8%3F%20--%3E%0A%0A*%20**Reproduce%20the%20error**%20%0A%0A%3C!--%20an%20unambiguous%20set%20of%20steps%20to%20reproduce%20the%20error.%20If%20you%20have%20a%20JavaScript%20error%2C%20maybe%20you%20can%20provide%20a%20live%20example%20with%0A%20%20%5BJSFiddle%5D(http%3A%2F%2Fjsfiddle.net%2F)%3F%20--%3E%0A%0A*%20**Related%20issues**%20%0A%0A%3C!--%20has%20a%20similar%20issue%20been%20reported%20before%3F%20--%3E%0A%0A*%20**Suggest%20a%20Fix**%20%0A%0A%3C!--%20if%20you%20can%27t%20fix%20the%20bug%20yourself%2C%20perhaps%20you%20can%20point%20to%20what%20might%20be%0A%20%20causing%20the%20problem%20(line%20of%20code%20or%20commit)%20--%3E
