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
import needleBase from '../../needle-base.js';

export default class extends needleBase {
  addStyle(style: string, comment: string | undefined, filePath: string, needle: string) {
    const content = this._mergeStyleAndComment(style, comment);

    this.addBlockContentToFile(
      { file: filePath, needle, splicable: content, regexp: `\n${style}\n`, prettierAware: true },
      'Style not added to JHipster app.\n',
    );
  }

  _mergeStyleAndComment(style: string, comment?: string) {
    let styleBlock = '';

    if (comment) {
      styleBlock += '/* ==========================================================================\n';
      styleBlock += `${comment}\n`;
      styleBlock += '========================================================================== */\n';
    }
    styleBlock += `${style}\n`;

    return styleBlock;
  }
}
