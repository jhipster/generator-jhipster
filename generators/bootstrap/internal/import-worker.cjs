/**
 * Copyright 2013-2026 the original author or authors from the JHipster project.
 *
 * This file is part of the JHipster project, see https://www.jhipster.tech/
 * for more information.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

// The task module of the piscina pools. piscina loads a task module with `require()` first, and on Node versions with
// `require(esm)` it loads an ES module that way; several worker threads doing that at the same time abort the process
// (`v8::Module::IsGraphAsync must be used on an instantiated module`). A CommonJS module is required without that, and
// loads the ES module of the pool, `workerData.workerModule`, with `import()`.
const { workerData } = require('piscina');

let handler;

module.exports = async task => {
  handler ??= (await import(workerData.workerModule)).default;
  return handler(task);
};
