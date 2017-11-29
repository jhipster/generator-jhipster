/* global describe, beforeEach, it */

const assert = require('yeoman-assert');
const utils = require('../generators/utils');

const fse = require('fs-extra');
const chai = require('chai');
// Load dirty chai first to hook plugin extensions
const dirtyChai = require('dirty-chai');
const path = require('path');
const os = require('os');
const jsyaml = require('js-yaml');

chai.use(dirtyChai);
const expect = chai.expect;
const BaseGenerator = require('../generators/app/index').prototype;

BaseGenerator.log = (msg) => {
    console.log(msg);// eslint-disable-line no-console
};
const memFs = require('mem-fs');
const editor = require('mem-fs-editor');

const store = memFs.create();
const fs = editor.create(store);
BaseGenerator.fs = fs;
process.on('unhandledRejection', (error) => {
    // Will print "unhandledRejection err is not defined"
    console.log('unhandledRejection', error.stack);// eslint-disable-line no-console
});
function copyYamlTemp(filesrc, nameFileDest) {
    // const filesrc = path.join(__dirname, filesrc);
    const tmpdir = fse.mkdtempSync(path.join(os.tmpdir(), 'jhipster-'));
    const file = path.join(tmpdir, nameFileDest);
    // BaseGenerator.fs.createReadStream(path.join(__dirname, filesrc)).pipe(BaseGenerator.fs.createWriteStream(file));
    fse.copySync(path.join(__dirname, filesrc), file);
    // fse.readFileSync(file);

    return file;
}

function deleteDirTemp(file) {
    fse.unlinkSync(file);
    fse.rmdirSync(path.dirname(file));
}

describe('JHipster Utils', () => {
    describe('::getJavadoc', () => {
        describe('when passing a negative or nil increment', () => {
            it('returns the comment with no increment', () => {
                assert.textEqual(utils.getJavadoc('whatever', -42), '/**\n * whatever\n */');
                assert.textEqual(utils.getJavadoc('whatever', 0), '/**\n * whatever\n */');
            });
        });
        describe('when passing a positive increment', () => {
            it('returns the comment with the increment', () => {
                assert.textEqual(utils.getJavadoc('whatever', 1), ' /**\n  * whatever\n  */');
            });
        });
        describe('when passing a nil comment', () => {
            it('inserts an empty comment instead of failing', () => {
                assert.textEqual(utils.getJavadoc(null, 1), ' /**\n  * \n  */');
            });
        });
        describe('when passing a comment containing double quotes', () => {
            it('escapes the quotes', () => {
                assert.textEqual(utils.getJavadoc('Comment="KO"', 1), ' /**\n  * Comment=\\"KO\\"\n  */');
            });
        });
    });
    describe('Test array property', () => {
        describe('Get array property', () => {
            it('get property on array null', () => {
                const result = utils.getPropertyInArray(null, 'test', BaseGenerator);
                expect(result).to.be.undefined();
            });
            it('get property on array empty', () => {
                const result = utils.getPropertyInArray({}, 'test', BaseGenerator);
                expect(result).to.be.undefined();
            });
            it('get a simple property that does not exist in a non-empty array', () => {
                const array = ['spring', 'application'];
                const result = utils.getPropertyInArray(array, 'test', BaseGenerator);
                expect(result).to.be.undefined();
            });
            it('get a property that does not exist in a non-empty array', () => {
                const yaml = { spring: { cloud: 'stream' }, application: null };
                const result = utils.getPropertyInArray(yaml, 'spring.cloud.toto', BaseGenerator);
                expect(result).to.be.undefined();
            });
            it('get a simple property that exist in a non-empty array', () => {
                const yaml = { spring: { cloud: 'stream' }, application: null };
                const result = utils.getPropertyInArray(yaml, 'spring', BaseGenerator);
                expect(result).eql({ cloud: 'stream' });
            });
            it('get a property that exist in a non-empty array', () => {
                const yaml = { spring: { cloud: 'stream' }, application: null };
                const result = utils.getPropertyInArray(yaml, 'spring.cloud', BaseGenerator);
                expect(result).eql('stream');
            });
            it('get a property that exist in a non-empty array', () => {
                const yaml = { spring: { cloud: 'stream' }, application: null };
                const result = utils.getPropertyInArray(yaml, 'spring.cloud', BaseGenerator);
                expect(result).eql('stream');
            });
        });
        describe('add/Update array property', () => {
            it('update property on array null', () => {
                const result = utils.updatePropertyInArray(null, 'spring.cloud', BaseGenerator, 'value');
                expect(result).to.be.undefined();
            });
            it('update property on array empty', () => {
                const result = utils.updatePropertyInArray({}, 'spring.cloud', BaseGenerator, 'value');
                expect(result).to.be.undefined();
            });
            it('add a simple property that does not exist in a non-empty array', () => {
                const array = ['spring', 'application'];
                utils.updatePropertyInArray(array, 'toto', BaseGenerator, 'value');
                const result = utils.getPropertyInArray(array, 'toto', BaseGenerator);
                expect(result).eql('value');
            });
            it('update a simple property that exist in a non-empty array', () => {
                const yaml = { spring: { cloud: 'stream' }, application: null };
                utils.updatePropertyInArray(yaml, 'spring', BaseGenerator, 'value');
                const result = utils.getPropertyInArray(yaml, 'spring', BaseGenerator);
                expect(result).eql('value');
            });
            it('update a property that exist in a non-empty array', () => {
                const yaml = { spring: { cloud: 'stream' }, application: null };
                utils.updatePropertyInArray(yaml, 'spring.cloud', BaseGenerator, 'value');
                const result = utils.getPropertyInArray(yaml, 'spring.cloud', BaseGenerator);
                expect(result).eql('value');
            });
        });
        describe('Delete array property', () => {
            it('Delete property on array null', () => {
                const result = utils.deletePropertyInArray(null, 'spring.cloud', BaseGenerator, 'value');
                expect(result).to.be.undefined();
            });
            it('Delete property on array empty', () => {
                const result = utils.deletePropertyInArray({}, 'spring.cloud', BaseGenerator, 'value');
                expect(result).to.be.undefined();
            });
            it('Delete a simple property that does not exist in a non-empty array', () => {
                const yaml = { spring: { cloud: 'stream' }, application: null };
                utils.deletePropertyInArray(yaml, 'toto', BaseGenerator);
                const length = Object.keys(yaml).length;
                expect(length).eql(2);
            });
            it('Delete a simple property that exist in a non-empty array', () => {
                const yaml = {
                    spring: {
                        cloud: 'stream',
                        profiles: 'dev'
                    },
                    application: null
                };
                utils.deletePropertyInArray(yaml, 'application', BaseGenerator);
                expect(Object.keys(yaml).length).eql(1);
                expect(Object.keys(yaml.spring).length).eql(2);
            });
            it('Delete a  property that  exist in a non-empty array', () => {
                const yaml = {
                    spring: {
                        cloud: 'stream',
                        profiles: 'dev'
                    },
                    application: null
                };
                utils.deletePropertyInArray(yaml, 'spring.cloud', BaseGenerator);
                const length = Object.keys(yaml.spring).length;
                expect(length).eql(1);
            });
        });
    });
    describe('Test yaml property', () => {
        describe('Get YAML property', () => {
            it('get property that doesnt exist', () => {
                const file = path.join(__dirname, '../test/templates/utils/application-dev.yml');
                const result = utils.getYamlProperty(file, 'toto', BaseGenerator);
                expect(result).to.be.undefined();
            });
            it('get property on file empty', () => {
                const file = path.join(__dirname, '../test/templates/utils/yaml-empty.yml');
                const result = utils.getYamlProperty(file, 'toto', BaseGenerator);
                expect(result).to.be.undefined();
            });
            it('get property on file that doesn\'t exist', () => {
                const file = path.join(__dirname, '../test/templates/utils/application-totos.yml');
                expect(() => utils.getYamlProperty(file, 'spring', BaseGenerator)).to.throw(/doesn't exist/);
            });
            it('get simple property that exist', () => {
                const file = path.join(__dirname, '../test/templates/utils/application-dev.yml');
                const result = utils.getYamlProperty(file, 'liquibase', BaseGenerator);
                expect(result).eql({ contexts: 'dev' });
            });
            it('get property that exist', () => {
                const file = path.join(__dirname, '../test/templates/utils/application-dev.yml');
                const result = utils.getYamlProperty(file, 'liquibase.contexts', BaseGenerator);
                expect(result).eql('dev');
            });
        });
        describe('Add YAML properties', () => {
            it('add properties at beginin of file', () => {
                const file = copyYamlTemp('../test/templates/utils/application-dev.yml', 'application-dev.yml');
                const yaml = { toto: { cloud: 'stream' } };
                utils.addYamlPropertiesAtBeginin(file, yaml, BaseGenerator);
                const result = utils.getYamlProperty(file, 'toto.cloud', BaseGenerator);
                expect(result).eql('stream');
                const body = BaseGenerator.fs.read(file);
                const lines = body.split('\n');
                expect(lines[0].indexOf('toto:')).eql(0);
                deleteDirTemp(file);
            });
            it('add v at end of file', () => {
                const file = copyYamlTemp('../test/templates/utils/application-dev.yml', 'application-dev.yml');
                const yaml = { toto: { cloud: 'stream' } };
                utils.addYamlPropertiesAtEnd(file, yaml, BaseGenerator);
                const result = utils.getYamlProperty(file, 'toto.cloud', BaseGenerator);
                expect(result).eql('stream');
                const lines = BaseGenerator.fs.read(file).split('\n');
                expect(lines[lines.length - 3].indexOf('toto:')).eql(0);
                expect(lines[lines.length - 2].indexOf('cloud:')).not.eql(-1);
                expect(lines[lines.length - 2].indexOf('stream')).not.eql(-1);
                deleteDirTemp(file);
            });
            it('add yaml properties before another property and his comment', () => {
                const file = copyYamlTemp('../test/templates/utils/application-dev.yml', 'application-dev.yml');
                const yaml = { toto: { cloud: 'stream' } };
                utils.addYamlPropertiesBeforeAnotherProperty(file, yaml, BaseGenerator, 'jhipster', true);
                const result = utils.getYamlProperty(file, 'toto.cloud', BaseGenerator);
                expect(result).eql('stream');
                const lines = BaseGenerator.fs.read(file).split('\n');
                expect(lines[77].indexOf('toto:')).eql(0);
                expect(lines[78].indexOf('cloud:')).not.eql(-1);
                expect(lines[78].indexOf('stream')).not.eql(-1);
                deleteDirTemp(file);
            });
            it('add yaml properties before another property without his comment', () => {
                const file = copyYamlTemp('../test/templates/utils/application-dev.yml', 'application-dev.yml');
                const yaml = { toto: { cloud: 'stream' } };
                utils.addYamlPropertiesBeforeAnotherProperty(file, yaml, BaseGenerator, 'jhipster', false);
                const result = utils.getYamlProperty(file, 'toto.cloud', BaseGenerator);
                expect(result).eql('stream');
                const lines = BaseGenerator.fs.read(file).split('\n');
                expect(lines[83].indexOf('toto:')).eql(0);
                expect(lines[84].indexOf('cloud:')).not.eql(-1);
                expect(lines[84].indexOf('stream')).not.eql(-1);
                deleteDirTemp(file);
            });
            it('add yaml properties before another property that don\'t exist', () => {
                const file = copyYamlTemp('../test/templates/utils/application-dev.yml', 'application-dev.yml');
                const yaml = { toto: { cloud: 'stream' } };
                expect(() => utils.addYamlPropertiesBeforeAnotherProperty(file, yaml, BaseGenerator, 'titi')).to.throw(/not found/);
                deleteDirTemp(file);
            });
            it('add yaml properties after another simple property', () => {
                const file = copyYamlTemp('../test/templates/utils/application-dev.yml', 'application-dev.yml');
                const yaml = { toto: { cloud: 'stream' } };
                utils.addYamlPropertiesAfterAnotherProperty(file, yaml, BaseGenerator, 'jhipster');
                const result = utils.getYamlProperty(file, 'toto.cloud', BaseGenerator);
                expect(result).eql('stream');
                const lines = BaseGenerator.fs.read(file).split('\n');
                expect(lines[127].indexOf('toto:')).eql(0);
                expect(lines[128].indexOf('cloud:')).not.eql(-1);
                expect(lines[128].indexOf('stream')).not.eql(-1);
                deleteDirTemp(file);
            });
            it('add yaml properties after another property', () => {
                const file = copyYamlTemp('../test/templates/utils/application-dev.yml', 'application-dev.yml');
                const yaml = { toto: { cloud: 'stream' } };
                utils.addYamlPropertiesAfterAnotherProperty(file, yaml, BaseGenerator, 'jhipster.logging.logstash');
                const result = utils.getYamlProperty(file, 'toto.cloud', BaseGenerator);
                expect(result).eql('stream');
                const lines = BaseGenerator.fs.read(file).split('\n');
                expect(lines[127].indexOf('toto:')).eql(0);
                expect(lines[128].indexOf('cloud:')).not.eql(-1);
                expect(lines[128].indexOf('stream')).not.eql(-1);
                deleteDirTemp(file);
            });
            it('add yaml properties after another property that don\'t exist', () => {
                const file = copyYamlTemp('../test/templates/utils/application-dev.yml', 'application-dev.yml');
                const yaml = { toto: { cloud: 'stream' } };
                expect(() => utils.addYamlPropertiesAfterAnotherProperty(file, yaml, BaseGenerator, 'titi')).to.throw(/not found/);
                deleteDirTemp(file);
            });
            it('add yaml properties at specific index line with no space', () => {
                const file = copyYamlTemp('../test/templates/utils/application-dev.yml', 'application-dev.yml');
                const yaml = { toto: { cloud: 'stream' } };
                utils.addYamlPropertiesAtLineIndex(file, yaml, BaseGenerator, 10, 0);
                const result = utils.getYamlProperty(file, 'toto.cloud', BaseGenerator);
                expect(result).eql('stream');
                const lines = BaseGenerator.fs.read(file).split('\n');
                expect(lines[10].indexOf('toto:')).eql(0);
                expect(lines[11].indexOf('cloud:')).not.eql(-1);
                expect(lines[11].indexOf('stream')).not.eql(-1);
                deleteDirTemp(file);
            });
            it('add yaml properties at specific index line with space', () => {
                const file = copyYamlTemp('../test/templates/utils/application-dev.yml', 'application-dev.yml');
                const yaml = { cloud: 'stream' };
                utils.addYamlPropertiesAtLineIndex(file, yaml, BaseGenerator, 16, 4);
                const result = utils.getYamlProperty(file, 'spring.cloud', BaseGenerator);
                expect(result).eql('stream');
                const lines = BaseGenerator.fs.read(file).split('\n');
                expect(lines[16].indexOf('cloud:')).eql(4);
                expect(lines[16].indexOf('stream')).not.eql(-1);
                deleteDirTemp(file);
            });
        });
        describe('Add YAML property', () => {
            it('add property at beginin of file', () => {
                const file = copyYamlTemp('../test/templates/utils/application-dev.yml', 'application-dev.yml');
                const property = 'toto.cloud';
                utils.addYamlPropertyAtBeginin(file, property, 'stream', BaseGenerator);
                const result = utils.getYamlProperty(file, 'toto.cloud', BaseGenerator);
                expect(result).eql('stream');
                const body = BaseGenerator.fs.read(file);
                const lines = body.split('\n');
                expect(lines[0].indexOf('toto:')).eql(0);
                deleteDirTemp(file);
            });
            it('add property at end of file', () => {
                const file = copyYamlTemp('../test/templates/utils/application-dev.yml', 'application-dev.yml');
                const property = 'toto.cloud';
                utils.addYamlPropertyAtEnd(file, property, 'stream', BaseGenerator);
                const result = utils.getYamlProperty(file, 'toto.cloud', BaseGenerator);
                expect(result).eql('stream');
                const lines = BaseGenerator.fs.read(file).split('\n');
                expect(lines[lines.length - 3].indexOf('toto:')).eql(0);
                expect(lines[lines.length - 2].indexOf('cloud:')).not.eql(-1);
                expect(lines[lines.length - 2].indexOf('stream')).not.eql(-1);
                deleteDirTemp(file);
            });
            it('add yaml property before another property and his comment', () => {
                const file = copyYamlTemp('../test/templates/utils/application-dev.yml', 'application-dev.yml');
                const property = 'toto.cloud';
                utils.addYamlPropertyBeforeAnotherProperty(file, property, 'stream', BaseGenerator, 'jhipster', true);
                const result = utils.getYamlProperty(file, 'toto.cloud', BaseGenerator);
                expect(result).eql('stream');
                const lines = BaseGenerator.fs.read(file).split('\n');
                expect(lines[77].indexOf('toto:')).eql(0);
                expect(lines[78].indexOf('cloud:')).not.eql(-1);
                expect(lines[78].indexOf('stream')).not.eql(-1);
                deleteDirTemp(file);
            });
            it('add yaml property before another property without his comment', () => {
                const file = copyYamlTemp('../test/templates/utils/application-dev.yml', 'application-dev.yml');
                const property = 'toto.cloud';
                utils.addYamlPropertyBeforeAnotherProperty(file, property, 'stream', BaseGenerator, 'jhipster', false);
                const result = utils.getYamlProperty(file, 'toto.cloud', BaseGenerator);
                expect(result).eql('stream');
                const lines = BaseGenerator.fs.read(file).split('\n');
                expect(lines[83].indexOf('toto:')).eql(0);
                expect(lines[84].indexOf('cloud:')).not.eql(-1);
                expect(lines[84].indexOf('stream')).not.eql(-1);
                deleteDirTemp(file);
            });
            it('add yaml property before another property that don\'t exist', () => {
                const file = copyYamlTemp('../test/templates/utils/application-dev.yml', 'application-dev.yml');
                const property = 'toto.cloud';
                expect(() => utils.addYamlPropertyBeforeAnotherProperty(file, property, 'stream', BaseGenerator, 'titi')).to.throw(/not found/);
                deleteDirTemp(file);
            });
            it('add yaml property after another simple property', () => {
                const file = copyYamlTemp('../test/templates/utils/application-dev.yml', 'application-dev.yml');
                const property = 'toto.cloud';
                utils.addYamlPropertyAfterAnotherProperty(file, property, 'stream', BaseGenerator, 'jhipster');
                const result = utils.getYamlProperty(file, 'toto.cloud', BaseGenerator);
                expect(result).eql('stream');
                const lines = BaseGenerator.fs.read(file).split('\n');
                expect(lines[127].indexOf('toto:')).eql(0);
                expect(lines[128].indexOf('cloud:')).not.eql(-1);
                expect(lines[128].indexOf('stream')).not.eql(-1);
                deleteDirTemp(file);
            });
            it('add yaml property after another property', () => {
                const file = copyYamlTemp('../test/templates/utils/application-dev.yml', 'application-dev.yml');
                const property = 'toto.cloud';
                utils.addYamlPropertyAfterAnotherProperty(file, property, 'stream', BaseGenerator, 'jhipster.logging.logstash');
                const result = utils.getYamlProperty(file, 'toto.cloud', BaseGenerator);
                expect(result).eql('stream');
                const lines = BaseGenerator.fs.read(file).split('\n');
                expect(lines[127].indexOf('toto:')).eql(0);
                expect(lines[128].indexOf('cloud:')).not.eql(-1);
                expect(lines[128].indexOf('stream')).not.eql(-1);
                deleteDirTemp(file);
            });
            it('add yaml property after another property that don\'t exist', () => {
                const file = copyYamlTemp('../test/templates/utils/application-dev.yml', 'application-dev.yml');
                const property = 'toto.cloud';
                expect(() => utils.addYamlPropertyAfterAnotherProperty(file, property, 'stream', BaseGenerator, 'titi')).to.throw(/not found/);
                deleteDirTemp(file);
            });
            it('add yaml property at specific index line with no space', () => {
                const file = copyYamlTemp('../test/templates/utils/application-dev.yml', 'application-dev.yml');
                const property = 'toto.cloud';
                utils.addYamlPropertyAtLineIndex(file, property, 'stream', BaseGenerator, 10, 0);
                const result = utils.getYamlProperty(file, 'toto.cloud', BaseGenerator);
                expect(result).eql('stream');
                const lines = BaseGenerator.fs.read(file).split('\n');
                expect(lines[10].indexOf('toto:')).eql(0);
                expect(lines[11].indexOf('cloud:')).not.eql(-1);
                expect(lines[11].indexOf('stream')).not.eql(-1);
                deleteDirTemp(file);
            });
            it('add yaml property at specific index line with space', () => {
                const file = copyYamlTemp('../test/templates/utils/application-dev.yml', 'application-dev.yml');
                const property = 'cloud';
                utils.addYamlPropertyAtLineIndex(file, property, 'stream', BaseGenerator, 16, 4);
                const result = utils.getYamlProperty(file, 'spring.cloud', BaseGenerator);
                expect(result).eql('stream');
                const lines = BaseGenerator.fs.read(file).split('\n');
                expect(lines[16].indexOf('cloud:')).eql(4);
                expect(lines[16].indexOf('stream')).not.eql(-1);
                deleteDirTemp(file);
            });
        });
        describe('Add YAML property, updateYamlProperty (Intelligent method of adding a property in yaml)', () => {
            it('add a property that don\'t exist in the file', () => {
                const file = copyYamlTemp('../test/templates/utils/application-dev.yml', 'application-dev.yml');
                const property = 'toto.cloud';
                utils.updateYamlProperty(file, property, 'stream', BaseGenerator);
                const result = utils.getYamlProperty(file, 'toto.cloud', BaseGenerator);
                expect(result).eql('stream');
                const lines = BaseGenerator.fs.read(file).split('\n');
                expect(lines[140].indexOf('toto:')).eql(0);
                expect(lines[141].indexOf('stream')).not.eql(-1);
                deleteDirTemp(file);
            });
            it('add a property that exist partially in the file. one levels', () => {
                const file = copyYamlTemp('../test/templates/utils/application-dev.yml', 'application-dev.yml');
                const property = 'spring.cloud';
                utils.updateYamlProperty(file, property, 'stream', BaseGenerator);
                const result = utils.getYamlProperty(file, 'spring.cloud', BaseGenerator);
                expect(result).eql('stream');
                const lines = BaseGenerator.fs.read(file).split('\n');
                expect(lines[15].indexOf('spring:')).eql(0);
                expect(lines[53].indexOf('cloud:')).not.eql(-1);
                expect(lines[53].indexOf('stream')).not.eql(-1);
                deleteDirTemp(file);
            });
            it('add a property that exist partially in the file two levels', () => {
                const file = copyYamlTemp('../test/templates/utils/application-dev.yml', 'application-dev.yml');
                const property = 'spring.profiles.test';
                utils.updateYamlProperty(file, property, 'stream', BaseGenerator);
                const result = utils.getYamlProperty(file, 'spring.profiles.test', BaseGenerator);
                expect(result).eql('stream');
                const lines = BaseGenerator.fs.read(file).split('\n');
                expect(lines[15].indexOf('spring:'), 'spring').eql(0);
                expect(lines[16].indexOf('profiles:'), 'profiles').not.eql(-1);
                expect(lines[19].indexOf('test:'), 'test').not.eql(-1);
                expect(lines[19].indexOf('stream'), 'stream').not.eql(-1);
                deleteDirTemp(file);
            });
            it('add a property that exist partially in the file tree levels', () => {
                const file = copyYamlTemp('../test/templates/utils/application-dev.yml', 'application-dev.yml');
                const property = 'jhipster.security.authentication.test';
                utils.updateYamlProperty(file, property, 'stream', BaseGenerator);
                const result = utils.getYamlProperty(file, 'jhipster.security.authentication.test', BaseGenerator);
                expect(result).eql('stream');
                const lines = BaseGenerator.fs.read(file).split('\n');
                expect(lines[83].indexOf('jhipster:'), 'jhipster').eql(0);
                expect(lines[98].indexOf('security:'), 'security').not.eql(-1);
                expect(lines[99].indexOf('authentication:'), 'authentication').not.eql(-1);
                expect(lines[105].indexOf('test:'), 'test').not.eql(-1);
                expect(lines[105].indexOf('stream'), 'stream').not.eql(-1);
                deleteDirTemp(file);
            });
            it('add yaml property before complex property that is on one line or more (ex hibernate.id.new_generator_mappings)', () => {
                const file = copyYamlTemp('../test/templates/utils/application-dev.yml', 'application-dev.yml');
                utils.updateYamlProperty(file, 'spring.jpa.properties.hibernate.id.toto', 'stream', BaseGenerator);
                const result = utils.getYamlProperty(file, 'spring.jpa.properties.hibernate.id.toto', BaseGenerator);
                expect(result).eql('stream');
                const lines = BaseGenerator.fs.read(file).split('\n');
                expect(lines[44].indexOf('hibernate:')).eql(12);
                expect(lines[45].indexOf('id:')).eql(16);
                expect(lines[46].indexOf('toto:')).eql(20);
                expect(lines[46].indexOf('stream')).not.eql(-1);
                deleteDirTemp(file);
            });
        });
        describe('Add YAML properties, updateYamlProperties (Intelligent method of adding properties in yaml)', () => {
            it('add properties that don\'t exist in the file', () => {
                const file = copyYamlTemp('../test/templates/utils/application-dev.yml', 'application-dev.yml');
                const yaml = { toto: { cloud: 'stream' } };
                utils.updateYamlProperties(file, yaml, BaseGenerator);
                const result = utils.getYamlProperty(file, 'toto.cloud', BaseGenerator);
                expect(result).eql('stream');
                const lines = BaseGenerator.fs.read(file).split('\n');
                expect(lines[140].indexOf('toto:')).eql(0);
                expect(lines[141].indexOf('stream')).not.eql(-1);
                deleteDirTemp(file);
            });
            it('add properties that exist partially in the file. one levels', () => {
                const file = copyYamlTemp('../test/templates/utils/application-dev.yml', 'application-dev.yml');
                const yaml = { spring: { cloud: 'stream' } };
                utils.updateYamlProperties(file, yaml, BaseGenerator);
                const result = utils.getYamlProperty(file, 'spring.cloud', BaseGenerator);
                expect(result).eql('stream');
                const lines = BaseGenerator.fs.read(file).split('\n');
                expect(lines[15].indexOf('spring:')).eql(0);
                expect(lines[53].indexOf('cloud:')).not.eql(-1);
                expect(lines[53].indexOf('stream')).not.eql(-1);
                deleteDirTemp(file);
            });
            it('add properties that exist partially in the file two levels', () => {
                const file = copyYamlTemp('../test/templates/utils/application-dev.yml', 'application-dev.yml');
                const yaml = { spring: { profiles: { test: 'stream' } } };
                utils.updateYamlProperties(file, yaml, BaseGenerator);
                const result = utils.getYamlProperty(file, 'spring.profiles.test', BaseGenerator);
                expect(result).eql('stream');
                const lines = BaseGenerator.fs.read(file).split('\n');
                expect(lines[15].indexOf('spring:'), 'spring').eql(0);
                expect(lines[16].indexOf('profiles:'), 'profiles').not.eql(-1);
                expect(lines[19].indexOf('test:'), 'test').not.eql(-1);
                expect(lines[19].indexOf('stream'), 'stream').not.eql(-1);
                deleteDirTemp(file);
            });
            it('add properties that exist partially in the file tree levels', () => {
                const file = copyYamlTemp('../test/templates/utils/application-dev.yml', 'application-dev.yml');
                const yaml = { jhipster: { security: { authentication: { test: 'stream' } } } };
                utils.updateYamlProperties(file, yaml, BaseGenerator);
                const result = utils.getYamlProperty(file, 'jhipster.security.authentication.test', BaseGenerator);
                expect(result).eql('stream');
                const lines = BaseGenerator.fs.read(file).split('\n');
                expect(lines[83].indexOf('jhipster:'), 'jhipster').eql(0);
                expect(lines[98].indexOf('security:'), 'security').not.eql(-1);
                expect(lines[99].indexOf('authentication:'), 'authentication').not.eql(-1);
                expect(lines[105].indexOf('test:'), 'test').not.eql(-1);
                expect(lines[105].indexOf('stream'), 'stream').not.eql(-1);
                deleteDirTemp(file);
            });
            it('add properties that exist partially in the file x levels', () => {
                const file = copyYamlTemp('../test/templates/utils/application-dev.yml', 'application-dev.yml');
                const yamlAppDevProperties = {};
                utils.updatePropertyInArray(yamlAppDevProperties, 'spring.cloud.stream.default.contentType', BaseGenerator, 'application/json');
                utils.updatePropertyInArray(yamlAppDevProperties, 'spring.cloud.stream.bindings.input.destination', BaseGenerator, 'topic-jhipster');
                utils.updatePropertyInArray(yamlAppDevProperties, 'spring.cloud.stream.bindings.output.destination', BaseGenerator, 'topic-jhipster');
                utils.updatePropertyInArray(yamlAppDevProperties, 'spring.cloud.stream.bindings.rabbit.bindings.output.producer.routingKeyExpression', BaseGenerator, 'headers.title');
                utils.updateYamlProperties(file, yamlAppDevProperties, BaseGenerator);
                const result = utils.getYamlProperty(file, 'spring.cloud.stream.bindings.output.destination', BaseGenerator);
                expect(result).eql('topic-jhipster');
                deleteDirTemp(file);
            });
            it('add properties that exist, don\'t duplicate key update the file', () => {
                const file = copyYamlTemp('../test/templates/utils/application-dev.yml', 'application-dev.yml');
                const yamlAppDevProperties = {};
                utils.updatePropertyInArray(yamlAppDevProperties, 'spring.jpa.database-platform', BaseGenerator, 'Test');
                utils.updateYamlProperties(file, yamlAppDevProperties, BaseGenerator);
                expect(() => utils.getYamlProperty(file, 'spring.jpa.database-platform', BaseGenerator)).not.to.throw(/no such file or directory/);
                deleteDirTemp(file);
            });
            it('add properties before complex property that is on one line or more (ex hibernate.id.new_generator_mappings)', () => {
                const file = copyYamlTemp('../test/templates/utils/application-dev.yml', 'application-dev.yml');
                const yamlAppDevProperties = {};
                utils.updatePropertyInArray(yamlAppDevProperties, 'spring.jpa.properties.hibernate.id.toto', BaseGenerator, 'stream');
                utils.updateYamlProperties(file, yamlAppDevProperties, BaseGenerator);
                const result = utils.getYamlProperty(file, 'spring.jpa.properties.hibernate.id.toto', BaseGenerator);
                expect(result).eql('stream');
                const lines = BaseGenerator.fs.read(file).split('\n');
                expect(lines[44].indexOf('hibernate:')).eql(12);
                expect(lines[45].indexOf('id:')).eql(16);
                expect(lines[46].indexOf('toto:')).eql(20);
                expect(lines[46].indexOf('stream')).not.eql(-1);
                deleteDirTemp(file);
            });
        });
        describe.skip('update YAML properties', () => {
            it('update YAML properties ', () => {

            });
        });
        describe.skip('Delete YAML properties', () => {
            it('delete YAML properties ', () => {

            });
        });
        describe('functions', () => {
            it('getPathAndValueOfAllProperty ', () => {
                const file = copyYamlTemp('../test/templates/utils/application-dev.yml', 'application-dev.yml');
                const object = jsyaml.safeLoad(BaseGenerator.fs.read(file));
                const arrayRetur = [];
                utils.getPathAndValueOfAllProperty(object, '', arrayRetur, BaseGenerator);
                //  BaseGenerator.log(arrayRetur);
                expect(arrayRetur.length).eql(54);
                deleteDirTemp(file);
            });
            it('getLastPropertyCommonHierarchy ', () => {
                const file = copyYamlTemp('../test/templates/utils/application-dev.yml', 'application-dev.yml');
                const property = 'spring';
                const propExist = utils.getLastPropertyCommonHierarchy(file, property, BaseGenerator);
                expect(propExist).eql('spring');
                deleteDirTemp(file);
            });
            it('getLastPropertyCommonHierarchy ', () => {
                const file = copyYamlTemp('../test/templates/utils/application-dev.yml', 'application-dev.yml');
                const property = 'spring.profiles';
                const propExist = utils.getLastPropertyCommonHierarchy(file, property, BaseGenerator);
                expect(propExist).eql('spring.profiles');
                deleteDirTemp(file);
            });
            it('getLastPropertyCommonHierarchy ', () => {
                const file = copyYamlTemp('../test/templates/utils/application-dev.yml', 'application-dev.yml');
                const property = 'spring.profiles.test';
                const propExist = utils.getLastPropertyCommonHierarchy(file, property, BaseGenerator);
                expect(propExist).eql('spring.profiles');
                deleteDirTemp(file);
            });
            it('getLastPropertyCommonHierarchy ', () => {
                const file = copyYamlTemp('../test/templates/utils/application-dev.yml', 'application-dev.yml');
                const property = 'spring.profiles.active';
                const propExist = utils.getLastPropertyCommonHierarchy(file, property, BaseGenerator);
                expect(propExist).eql('spring.profiles.active');
                deleteDirTemp(file);
            });
            it('getLastPropertyCommonHierarchy ', () => {
                const file = copyYamlTemp('../test/templates/utils/application-dev.yml', 'application-dev.yml');
                const property = 'toto';
                const propExist = utils.getLastPropertyCommonHierarchy(file, property, BaseGenerator);
                expect(propExist).to.be.undefined();
                deleteDirTemp(file);
            });
        });
    });
});
