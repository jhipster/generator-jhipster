/**
 * Copyright 2013-2024 the original author or authors from the JHipster project.
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

import type { JHipsterOptionDefinition } from '../../../lib/jdl/types/parsing-types.js';
import type { OptionWithDerivedProperties } from '../../base-application/application-options.js';

export const MESSAGE_BROKER = 'messageBroker';

export const MESSAGE_BROKER_KAFKA = 'kafka';
export const MESSAGE_BROKER_PULSAR = 'pulsar';
export const MESSAGE_BROKER_NO = 'no';

const ALPHANUMERIC_PATTERN = /^[A-Za-z][A-Za-z0-9]*$/;

const optionDefinition: JHipsterOptionDefinition = {
  name: MESSAGE_BROKER,
  type: 'string',
  tokenType: 'NAME',
  tokenValuePattern: ALPHANUMERIC_PATTERN,
  knownChoices: [MESSAGE_BROKER_NO, MESSAGE_BROKER_KAFKA, MESSAGE_BROKER_PULSAR],
};

export default optionDefinition;

type MessageBrokerTypes = [typeof MESSAGE_BROKER_KAFKA, typeof MESSAGE_BROKER_PULSAR, typeof MESSAGE_BROKER_NO];

export type MessageBrokerApplicationType = OptionWithDerivedProperties<typeof MESSAGE_BROKER, MessageBrokerTypes>;
