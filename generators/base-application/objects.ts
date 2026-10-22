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
 * A type in the configuration of an object: a type of the JDL or an enum, a reference to an entity
 * (`{ "$ref": ".jhipster/Order.json" }`) or to an object (`{ "$ref": "#/objects/Quote" }`), or a list of the type of its
 * items.
 */
export type ApplicationObjectConfigType = string | { $ref: string } | ApplicationObjectConfigType[];

/** A field of an object, as the `objects` of the `.yo-rc.json` file declare it. */
export type ApplicationObjectFieldConfig = {
  type: ApplicationObjectConfigType;
  documentation?: string;
  /** The validations of the field by name, with their value. */
  validations?: Record<string, unknown>;
  annotations?: Record<string, unknown>;
};

/** An object of the application, as the `objects` of the `.yo-rc.json` file declare it, by its name. */
export type ApplicationObjectConfig = {
  /** The type of the object, the name of the custom object handling it (`service`), or `<blueprint>:<type>`. */
  type: string;
  documentation?: string;
  /** The annotations of the object by name, in lower camel case, with their value. */
  annotations?: Record<string, unknown>;
  fields?: Record<string, ApplicationObjectFieldConfig>;
};

/**
 * An object of the application: its configuration, with its name, and the objects and the entities it references embedded
 * in place of their reference.
 */
export type ApplicationObject = Omit<ApplicationObjectConfig, 'fields'> & {
  name: string;
  fields?: Record<string, Omit<ApplicationObjectFieldConfig, 'type'> & { type: any }>;
} & Record<string, any>;
