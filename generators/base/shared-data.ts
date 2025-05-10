import CoreSharedData from '../base-core/shared-data.js';
import type { BaseApplication, BaseControl, BaseEntity, BaseSources } from './types.js';

/**
 * Copyright 2013-2025 the original author or authors from the JHipster project.
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
export default class BaseSharedData<
  Entity extends BaseEntity,
  StoredApplication extends BaseApplication<Entity>,
  ApplicationType extends BaseSources<Entity, StoredApplication>,
  Control extends BaseControl,
> extends CoreSharedData<Entity, StoredApplication, ApplicationType, Control> {}
