/**
 * Copyright 2013-2017 the original author or authors from the JHipster project.
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
/* eslint-disable no-unused-expressions */

const { mkdirSync, readFileSync, rmdirSync, statSync, unlinkSync, writeFileSync } = require('fs');
const { expect } = require('chai');
const { checkPath, createFolderIfNeeded, writeConfigFile } = require('../../../lib/exporters/export_utils');

describe('ExportUtils', () => {
  describe('checkPath', () => {
    context('when a folder does not already exist', () => {
      it('should not throw any error', () => {
        expect(() => checkPath('AFolderThatDoesNotAlreadyExist')).not.to.throw();
      });
    });
    context('when a folder already exists', () => {
      it('should not throw any error', () => {
        expect(() => checkPath('..')).not.to.throw();
      });
    });
    context('when a file already exists', () => {
      it('should throw an error', () => {
        expect(() => checkPath('package.json')).to.throw(
          /^A file 'package.json' already exists, so a folder of the same name can't be created for the application\.$/
        );
      });
    });
    context('when a file does not already exist', () => {
      it('should not throw any error', () => {
        expect(() => checkPath('AFileThatDoesNotAlreadyExist')).not.to.throw();
      });
    });
  });
  describe('createFolderIfNeeded', () => {
    context('when the folder does not exist', () => {
      let statObject;

      before(() => {
        createFolderIfNeeded('folderForTesting');
        statObject = statSync('folderForTesting');
      });

      after(() => {
        rmdirSync('folderForTesting');
      });
      it('should create it', () => {
        expect(statObject.isDirectory()).to.be.true;
      });
    });
    context('when the folder exists', () => {
      let statObject;

      before(() => {
        mkdirSync('folderForTesting');
        createFolderIfNeeded('folderForTesting');
        statObject = statSync('folderForTesting');
      });

      after(() => {
        rmdirSync('folderForTesting');
      });
      it('should not fail', () => {
        expect(statObject.isDirectory()).to.be.true;
      });
    });
  });
  describe('writeConfigFile', () => {
    context('when there is no .yo-rc.json file present', () => {
      let exportedConfig;
      let expectedConfig;

      before(() => {
        const config = {
          'generator-jhipster': {
            jhipsterVersion: '7.0.0'
          }
        };
        writeConfigFile(config);
        exportedConfig = JSON.parse(readFileSync('.yo-rc.json', { encoding: 'utf-8' }));
        expectedConfig = config;
      });
      after(() => {
        unlinkSync('.yo-rc.json');
      });

      it('should export the config', () => {
        expect(exportedConfig).to.deep.equal(expectedConfig);
      });
    });
    context('when there is a .yo-rc.json file present', () => {
      let exportedConfig;
      let expectedConfig;

      before(() => {
        const existingConfig = {
          'generator-jhipster': {
            jhipsterVersion: '6.5.4'
          },
          somethingElse: {
            answer: 42
          }
        };
        writeFileSync('.yo-rc.json', JSON.stringify(existingConfig, null, 2));
        const newConfig = {
          'generator-jhipster': {
            jhipsterVersion: '7.0.0'
          },
          somethingNew: {
            question: 'No comment'
          }
        };
        writeConfigFile(newConfig);
        exportedConfig = JSON.parse(readFileSync('.yo-rc.json', { encoding: 'utf-8' }));
        expectedConfig = {
          'generator-jhipster': {
            jhipsterVersion: '7.0.0'
          },
          somethingElse: {
            answer: 42
          },
          somethingNew: {
            question: 'No comment'
          }
        };
      });
      after(() => {
        unlinkSync('.yo-rc.json');
      });

      it('should export the config', () => {
        expect(exportedConfig).to.deep.equal(expectedConfig);
      });
    });
  });
});
