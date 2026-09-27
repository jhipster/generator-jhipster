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

/**
 * The piscina options of a pool whose tasks run the default export of an ES module. The pool loads `import-worker.cjs`,
 * which imports the module: piscina would load it with `require()`, which aborts the process when worker threads do it
 * at the same time.
 */
export const esmWorkerPoolOptions = (workerModule: URL) => ({
  filename: new URL('./import-worker.cjs', import.meta.url).href,
  workerData: { workerModule: workerModule.href },
});
