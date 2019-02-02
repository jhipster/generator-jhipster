/**
 * Copyright 2013-2018 the original author or authors from the JHipster project.
 *
 * This file is part of the JHipster project, see http://www.jhipster.tech/
 * for more information.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/**
 * Custom implementation of a Set.
 */
class CustomSet extends Set {
  add(element) {
    if (element === null || element === undefined) {
      throw new Error("Can't add a nil element to the set.");
    }
    super.add(element);
    return this;
  }

  addAll(elements = []) {
    elements.forEach(element => {
      if (element === null || element === undefined) {
        throw new Error("Can't add a nil element to the set.");
      }
      this.add(element);
    });
    return this;
  }

  join(separator) {
    return Array.from(this).join(separator);
  }

  filter(passedFunction) {
    if (!passedFunction) {
      throw new Error('The function must not be nil.');
    }
    const filteredElements = new CustomSet();
    this.forEach(element => {
      if (passedFunction(element)) {
        filteredElements.add(element);
      }
    });
    return filteredElements;
  }

  toString() {
    return `[${Array.from(this).toString()}]`;
  }
}

module.exports = CustomSet;
