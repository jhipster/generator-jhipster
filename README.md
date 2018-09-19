# JHipster-vuejs
[![NPM version][npm-image]][npm-url] [![Build Status][travis-image]][travis-url] [![Dependency Status][daviddm-image]][daviddm-url]
> JHipster-vuejs, A vueJs blueprint for JHipster. It will use VueJS as the frontend library

# Introduction

This is a [JHipster](http://jhipster.github.io/) blueprint, that is meant to be used in a JHipster application.

# Prerequisites

As this is a [JHipster](http://jhipster.github.io/) blueprint, we expect you have JHipster and its related tools already installed:

- [Installing JHipster](https://jhipster.github.io/installation.html)

# Installation


## With NPM

To install this blueprint:

```bash
npm install -g generator-jhipster-vuejs
```

To update this blueprint:

```bash
npm update -g generator-jhipster-vuejs
```

## With Yarn

To install this blueprint:

```bash
yarn global add generator-jhipster-vuejs
```

To update this blueprint:

```bash
yarn global upgrade generator-jhipster-vuejs
```

# Usage

To use this blueprint, run 

```bash
jhipster --blueprint vuejs
```


## Running local Blueprint version for development

During development of blueprint, please note the below steps. They are very important.

1. Clone this repo locally and cd into it, then link your blueprint globally 

```bash
git clone https://github.com/jhipster/jhipster-vuejs.git
cd jhipster-vuejs
npm link
```

2. optional: Link a development version of JHipster to your blueprint (optional: required only if you want to use a non-released JHipster version, like the master branch or your own custom fork)

```bash
cd generator-jhipster
npm link

cd jhipster-vuejs
npm link generator-jhipster
```

3. Create a new folder for the app to be generated and link JHipster and your blueprint there

```bash
mkdir my-app && cd my-app

npm link generator-jhipster-vuejs
npm link generator-jhipster (Optional: Needed only if you are using a non-released JHipster version)

jhipster -d --blueprint vuejs

```

# License

Apache-2.0 © [Deepu K Sasidharan](https://deepu.js.org)


[npm-image]: https://img.shields.io/npm/v/generator-jhipster-vuejs.svg
[npm-url]: https://npmjs.org/package/generator-jhipster-vuejs
[travis-image]: https://travis-ci.org/jhipster/jhipster-vuejs.svg?branch=master
[travis-url]: https://travis-ci.org/jhipster/jhipster-vuejs
[daviddm-image]: https://david-dm.org/jhipster/jhipster-vuejs.svg?theme=shields.io
[daviddm-url]: https://david-dm.org/jhipster/jhipster-vuejs
