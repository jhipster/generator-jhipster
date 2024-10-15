#!/usr/bin/env node
// Executable file that runs jhipster sources in JIT mode.
// This file should be used for development purposes and should not be distributed in the npm package.
// Executable should be written in commonjs https://github.com/nodejs/modules/issues/152.
const { Module } = require('module');
const { pathToFileURL } = require('url');

const [_nodeExec, _exec, ...args] = process.argv;
// eslint-disable-next-line no-console
console.error('jhipster', ...args);

process.env.JHIPSTER_DEV_BLUEPRINT = true;
Module.register(pathToFileURL(require.resolve('@node-loaders/esbuild/strict')).href);

require('../cli/jhipster.cjs');
