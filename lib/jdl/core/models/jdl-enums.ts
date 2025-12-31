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
import type JDLEnum from './jdl-enum.ts';

export default class JDLEnums {
  enums: Map<string, JDLEnum>;

  constructor() {
    this.enums = new Map();
  }

  add(jdlEnum: JDLEnum) {
    if (!jdlEnum) {
      throw new Error("Can't add a nil JDL enum to the JDL enums.");
    }
    this.enums.set(jdlEnum.name, jdlEnum);
  }

  get(enumName: string) {
    return this.enums.get(enumName);
  }

  has(enumName: string): boolean {
    return this.enums.has(enumName);
  }

  size(): number {
    return this.enums.size;
  }

  forEach(passedFunction: (jdlEnum: JDLEnum) => void): void {
    if (!passedFunction) {
      return;
    }
    this.enums.forEach(jdlEnum => {
      passedFunction(jdlEnum);
    });
  }

  toString(): string {
    let string = '';
    this.enums.forEach(jdlEnum => {
      string += `${jdlEnum.toString()}\n`;
    });
    return string;
  }
}
