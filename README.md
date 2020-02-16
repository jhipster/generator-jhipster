<div align="center">
  <a href="https://www.jhipster.tech/">
    <img src="https://github.com/jhipster/jhipster-artwork/blob/master/logos/JHipster%20RGB-small100x25px.png?raw=true">
  </a>
  <a href="https://vuejs.org/">
    <img width=100px src="https://avatars3.githubusercontent.com/u/6128107?s=200&v=4">
  </a>
</div>

[![NPM version][npm-image]][npm-url] [![Dependency Status][daviddm-image]][daviddm-url] [![Downloads][npmcharts-image]][npmcharts-url]

[![Generator Build Status][github-actions-generator-image]][github-actions-url] [![Vue.js Build Status][github-actions-vuejs-image]][github-actions-url]

# Introduction

This is a [JHipster](https://www.jhipster.tech/) blueprint.

# Prerequisites

As this is a [JHipster](https://www.jhipster.tech/) blueprint, we expect you have JHipster and its related tools already installed:

- [Installing JHipster](https://www.jhipster.tech/installation/)

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
jhipster --blueprints vuejs
```

## Create a new component page

To create a new Vue.js empty page, run

```bash
jhipster --blueprint vuejs page
```


## Running local Blueprint version for development

During development of blueprint, please note the below steps. They are very important.

1. Clone the projects

You'll probably need the current master of **generator-jhipster** :

- fork generator-jhipster: `https://github.com/jhipster/generator-jhipster/fork`
- clone locally your fork: `git clone https://github.com/<your_username>/generator-jhipster`
- `cd generator-jhipster`
- `git remote add upstream https://github.com/jhipster/generator-jhipster`
- so you'll be able to update regularly your fork, using `git fetch upstream && git checkout master && git rebase upstream/master`
- `npm ci`
- `npm link`

Then, about **jhipster-vuejs** :

- fork jhipster-vuejs: `https://github.com/jhipster/jhipster-vuejs/fork`
- clone locally your fork: `git clone https://github.com/<your_username>/jhipster-vuejs`
- `cd jhipster-vuejs`
- `git remote add upstream https://github.com/jhipster/jhipster-vuejs`
- so you'll be able to update regularly your fork, using `git fetch upstream && git checkout master && git rebase upstream/master`
- `npm ci`
- `npm link`
- `npm link generator-jhipster`


2. Create a new folder for the app to be generated and link JHipster and your blueprint there

```bash
mkdir my-app
cd my-app
npm link generator-jhipster-vuejs
jhipster -d --blueprints vuejs
```

# License

Apache-2.0 © [Deepu K Sasidharan](https://deepu.js.org)

[npm-image]: https://img.shields.io/npm/v/generator-jhipster-vuejs/latest.svg?style=flat
[npm-url]: https://npmjs.org/package/generator-jhipster-vuejs
[github-actions-generator-image]: https://github.com/jhipster/jhipster-vuejs/workflows/Generator/badge.svg
[github-actions-vuejs-image]: https://github.com/jhipster/jhipster-vuejs/workflows/Vue.js/badge.svg
[github-actions-url]: https://github.com/jhipster/jhipster-vuejs/actions
[daviddm-image]: https://david-dm.org/jhipster/jhipster-vuejs.svg?theme=shields.io
[daviddm-url]: https://david-dm.org/jhipster/jhipster-vuejs
[npmcharts-image]: https://img.shields.io/npm/dm/generator-jhipster-vuejs.svg?label=Downloads&style=flat
[npmcharts-url]: https://npmcharts.com/compare/generator-jhipster-vuejs
