# Contributing to JHipster

Are you ready to contribute to JHipster? We'd love to have you on board, and we will help you as much as we can. Here are the guidelines we'd like you to follow so that we can be of more help:

- [Questions and help](#question)
- [Issues and Bugs](#issue)
- [Bug bounties](#bounties)
- [Feature Requests](#feature)
- [RFCs](#rfcs)
- [Submission Guidelines](#submit)
- [Coding Rules](#rules)
- [Git Commit Guidelines](#commit)

And don't forget, we also accept [financial contributions to the project](https://www.jhipster.tech/sponsors/) using Open Collective.

## <a name="question"></a> Questions and help

This is the JHipster bug tracker, and it is used for [Issues and Bugs](#issue) and for [Feature Requests](#feature). It is **not** a help desk or a support forum.

If you have a question on using JHipster, or if you need help with your JHipster project, please [read our help page](https://www.jhipster.tech/help/) and use the [JHipster tag on StackOverflow](http://stackoverflow.com/tags/jhipster) or join our [Gitter.im chat room](https://gitter.im/jhipster/generator-jhipster).

## <a name="issue"></a> Issues and Bugs

If you find a bug in the source code or a mistake in the documentation, you can help us by [submitting a ticket](https://opensource.guide/how-to-contribute/#opening-an-issue) to our [GitHub issues](https://github.com/jhipster/generator-jhipster/issues). Even better, you can submit a Pull Request to our [JHipster generator project](https://github.com/jhipster/generator-jhipster) or to our [Documentation project](https://github.com/jhipster/jhipster.github.io).

**Please see the Submission Guidelines below**.

## <a name="feature"></a> Feature Requests

You can request a new feature by submitting a ticket to our [GitHub issues](https://github.com/jhipster/generator-jhipster/issues). If you
would like to implement a new feature then consider what kind of change it is:

- **Major Changes** that you wish to contribute to the project should be discussed first. Please open a ticket which clearly states that it is a feature request in the title and explain clearly what you want to achieve in the description, and the JHipster team will discuss with you what should be done in that ticket. You can then start working on a Pull Request. In order to communicate major changes proposals and receive reviews from the core team, you can also submit an RFC.
- **Small Changes** can be proposed without any discussion. Open up a ticket which clearly states that it is a feature request in the title. Explain your change in the description, and you can propose a Pull Request straight away.

## <a name="submit"></a> Submission Guidelines

### [Submitting an Issue](https://opensource.guide/how-to-contribute/#opening-an-issue)

Before you submit your issue search the [archive](https://github.com/jhipster/generator-jhipster/issues?utf8=%E2%9C%93&q=is%3Aissue), maybe your question was already answered.

If your issue appears to be a bug, and has not been reported, open a new issue.
Help us to maximize the effort we can spend fixing issues and adding new
features, by not reporting duplicate issues. Providing the following information will increase the
chances of your issue being dealt with quickly:

- **Overview of the issue** - if an error is being thrown a stack trace helps
- **Motivation for or Use Case** - explain why this is a bug for you
- **Reproduce the error** - an unambiguous set of steps to reproduce the error. If you have a JavaScript error, maybe you can provide a live example with
  [JSFiddle](http://jsfiddle.net/)?
- **Related issues** - has a similar issue been reported before?
- **Suggest a Fix** - if you can't fix the bug yourself, perhaps you can point to what might be
  causing the problem (line of code or commit)
- **JHipster Version(s)** - is it a regression?
- **JHipster configuration, a `.yo-rc.json` file generated in the root folder** - this will help us to replicate the scenario, you can remove the rememberMe key.
- **Entity configuration(s) `entityName.json` files generated in the `.jhipster` directory** - if the error is during an entity creation or associated with a specific entity
- **Browsers and Operating System** - is this a problem with all browsers or only IE8?

You can use `jhipster info` to provide us the information we need.

Click [here][issue-template] to open a bug issue with a pre-filled template. For feature requests and enquiries you can use [this template][feature-template].

You can run `jhipster info` in your project folder to get most of the above required info.

Issues opened without any of these info will be **closed** without any explanation.

## Development environment setup

See our [Development Guide](DEVELOPMENT.md) for more information on how to configure the JHipster generator for contributing.

### [Submitting a Pull Request](https://opensource.guide/how-to-contribute/#opening-a-pull-request)

Before you submit your pull request consider the following guidelines:

- Search [GitHub](https://github.com/jhipster/generator-jhipster/pulls?utf8=%E2%9C%93&q=is%3Apr) for an open or closed Pull Request
  that relates to your submission.
- Follow our [Coding Rules](#rules).
- In GitHub, send a pull request to `jhipster/generator-jhipster:main`.
- **Every CI tests must pass**.

That's it! Thank you for your contribution!

## <a name="rules"></a> Coding Rules

To ensure consistency throughout the source code, keep these rules in mind as you are working:

- All features or bug fixes **must be tested** by one or more tests.
- Most files formatting are checked by prettier and eslint.
- EJS files use a two-space indentation for template logic and follow the generated file rules for the templating parts.

The jhipster generator structure and file naming conventions are documented in the [RFC 6](./rfcs/6-jhipster-rfc-jhipster-generator-file-structure.md).

Please ensure to run `npm run lint` and `npm test` on the project root before submitting a pull request. You can also run `npm run lint-fix` to fix some of the lint issues automatically.

## <a name="commit"></a> Git Commit Guidelines

We have rules over how our git commit messages must be formatted. Please ensure to [squash](https://help.github.com/articles/about-git-rebase/#commands-available-while-rebasing) unnecessary commits so that your commit history is clean.

If the commit only involves documentation changes you can skip the continuous integration pipelines using `[ci skip]` or `[skip ci]` in your commit message header.

### <a name="commit-message-format"></a> Commit Message Format

Each commit message consists of a **header**, a **body** and a **footer**.

```
<header>
<BLANK LINE>
<body>
<BLANK LINE>
<footer>
```

Any line of the commit message cannot be longer than 100 characters! This allows the message to be easier
to read on GitHub as well as in various git tools.

### Header

The Header contains a succinct description of the change:

- use the imperative, present tense: "change" not "changed" nor "changes"
- don't capitalize first letter
- no dot (.) at the end

### Body

If your change is simple, the Body is optional.

Just as in the Header, use the imperative, present tense: "change" not "changed" nor "changes".
The Body should include the motivation for the change and contrast this with previous behavior.

### Footer

The footer is the place to reference GitHub issues that this commit **Closes**.

You **must** use the [GitHub keywords](https://help.github.com/articles/closing-issues-via-commit-messages) for
automatically closing the issues referenced in your commit.

### Example

For example, here is a good commit message:

```
upgrade to Spring Boot 1.1.7

upgrade the Maven and Gradle builds to use the new Spring Boot 1.1.7,
see http://spring.io/blog/2014/09/26/spring-boot-1-1-7-released

Fix #1234
```

### Regular Contributor Guidelines

These are some of the guidelines that we would like to emphasize if you are a regular contributor to the project
or joined the [JHipster team](https://www.jhipster.tech/team/).

- We recommend not committing directly to main, but always submit changes through PRs.
- Before merging, try to get at least one review on the PR.
- Add appropriate labels to issues and PRs that you create (if you have permission to do so).
- Follow the project's [policies](https://www.jhipster.tech/policies/#-policies).
- Follow the project's [Code of Conduct](https://github.com/jhipster/generator-jhipster/blob/main/CODE_OF_CONDUCT.md)
  and be polite and helpful to users when answering questions/bug reports and when reviewing PRs.
- We work on our free time, so we have no obligation nor commitment. Work/life balance is important, so don't
  feel tempted to put in all your free time fixing something.

[issue-template]: https://github.com/jhipster/generator-jhipster/issues/new?template=BUG_REPORT.md
[feature-template]: https://github.com/jhipster/generator-jhipster/issues/new?template=FEATURE_REQUEST.md

## <a name="rfcs"></a> RFCs

Sometimes, major feature requests are "complex" or "substantial". In this case, GitHub Issues might not be the best tool to present them because we will need a lot of going back and forth to reach a consensus.

So we ask that these feature requests be put through a formal design process and have their specifications described in an "RFC" (request for comments) that will be validated by the team through a Pull Request Review.

The RFC process is intended to provide a consistent and controlled path for major features and directions of the project.

To submit an RFC follow those steps:

1. Discuss the RFC proposal with the core team through GitHub issues or other channels
2. Create the initial GitHub issue for the Feature Request if it doesn't already exist
3. Copy the `rfcs/0-jhipster-rfc-template.md` to `rfcs/${featureRequestIssueNumber}-my-feature-request-name.md`
4. Fill in the RFC, make sure to complete every required section
5. Submit the RFC as a Pull Request with the summary of the proposal in the PR description
6. Build consensus and integrate feedback from the reviewers
7. The Pull Request is either accepted (merged), rejected (closed) or postponed (given an "on hold" status)

Note: The JHipster RFC process is inspired by [Rust RFCs](https://rust-lang.github.io/rfcs/).

## <a name="bounties"></a> Bug bounties

If you submitted a Pull Request that fixes a ticket with the "\$100" tag, then you are eligible for our bug bounty program! Go to our [bug bounties documentation](https://www.jhipster.tech/bug-bounties/) for more information, and claim your money.
