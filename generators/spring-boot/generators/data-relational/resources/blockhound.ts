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
 * The r2dbc-mariadb version whose `SimpleClient` lambdas were checked with `javap`.
 * `receive` and `sendCommand` acquire a lock inside their `Flux.create` lambdas, and javac numbers those lambdas,
 * so the names below change between driver releases.
 * BlockHound matches stack frames by method name, and while the lock is taken only the lambda is on the stack,
 * so allowing a stable name instead would mean allowing a reactor class for every caller.
 */
export const R2DBC_MARIADB_BLOCKHOUND_VERSION = '1.4.2';

export const R2DBC_MARIADB_LOCKING_LAMBDAS = ['lambda$receive$15', 'lambda$sendCommand$17', 'lambda$sendCommand$20'];
