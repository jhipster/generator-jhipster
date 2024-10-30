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
import { describe, expect, it } from 'esmocha';
import { normalizeLineEndings, stripMargin } from './contents.js';

describe('generator - base - support - contents', () => {
  describe('stripMargin', () => {
    it('should produce correct output without margin', () => {
      const entityFolderName = 'entityFolderName';
      const entityFileName = 'entityFileName';
      const content = `|export * from './${entityFolderName}/${entityFileName}-update.component';
                 |export * from './${entityFolderName}/${entityFileName}-delete-dialog.component';
                 |export * from './${entityFolderName}/${entityFileName}-detail.component';
                 |export * from './${entityFolderName}/${entityFileName}.component';
                 |export * from './${entityFolderName}/${entityFileName}.state';`;
      const out = `export * from './entityFolderName/entityFileName-update.component';
export * from './entityFolderName/entityFileName-delete-dialog.component';
export * from './entityFolderName/entityFileName-detail.component';
export * from './entityFolderName/entityFileName.component';
export * from './entityFolderName/entityFileName.state';`;
      expect(stripMargin(content)).toEqual(out);
    });
    it('should produce correct indented output without margin', () => {
      const routerName = 'routerName';
      const enableTranslation = true;
      const content = `|<li ui-sref-active="active">
                 |    <a ui-sref="${routerName}" ng-click="vm.collapseNavbar()">
                 |        <span ${enableTranslation ? `data-translate="global.menu.${routerName}"` : ''}>${routerName}</span>
                 |    </a>
                 |</li>`;
      const out = `<li ui-sref-active="active">
    <a ui-sref="routerName" ng-click="vm.collapseNavbar()">
        <span data-translate="global.menu.routerName">routerName</span>
    </a>
</li>`;
      expect(stripMargin(content)).toEqual(out);
    });
  });

  describe('::normalizeLineEndings', () => {
    it('should convert \\r\\n to \\n', () => {
      expect(normalizeLineEndings('a\r\ncrlf\r\nfile\r\nwith\nlf\nlines\r\n', '\r\n')).toBe('a\r\ncrlf\r\nfile\r\nwith\r\nlf\r\nlines\r\n');
    });
    it('should convert \\n to \\r\\n', () => {
      expect(normalizeLineEndings('a\r\ncrlf\r\nfile\r\nwith\nlf\nlines\r\n', '\n')).toBe('a\ncrlf\nfile\nwith\nlf\nlines\n');
    });
  });
});
