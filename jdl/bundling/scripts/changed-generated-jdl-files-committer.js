/**
 * Copyright 2013-2020 the original author or authors from the JHipster project.
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

const path = require('path');
const git = require('simple-git')();

const generatedGrammarFilesFolder = path.join('jdl', 'parsing', 'generated');
const generatedGrammarFile = 'generated-serialized-grammar.js';
const generatedGrammarHTMLFile = 'grammar.html';
const generatedJDLDistFilesFolder = path.join('jdl', 'bundling', 'dist');
const generatedJDLDistFileName = 'jdl-core.min.js';

module.exports = { commitChangedGeneratedJDLFiles };

async function commitChangedGeneratedJDLFiles() {
    const [jdlDistFilesHaveChanged, jdlGrammarFilesHaveChanged] = await Promise.all([
        haveTheJDLDistFilesChanged(),
        haveTheGeneratedJDLGrammarFilesChanged(),
    ]);
    const filesHaveChanged = jdlDistFilesHaveChanged || jdlGrammarFilesHaveChanged;
    if (!filesHaveChanged) {
        console.info('No JDL dist file changes.');
        return;
    }
    console.info('The JDL dist files have changed, committing them.');
    await addChangedJDLFiles();
    await commitChangedJDLFiles();
}

async function haveTheJDLDistFilesChanged() {
    const changes = await git.diff([path.join(generatedJDLDistFilesFolder, generatedJDLDistFileName)]);
    return !!changes;
}

async function haveTheGeneratedJDLGrammarFilesChanged() {
    const changes = await git.diff([
        path.join(generatedGrammarFilesFolder, generatedGrammarFile),
        path.join(generatedGrammarFilesFolder, generatedGrammarHTMLFile),
    ]);
    return !!changes;
}

async function addChangedJDLFiles() {
    await git.add(path.join(generatedJDLDistFilesFolder, generatedJDLDistFileName));
    await git.add(path.join(generatedGrammarFilesFolder, generatedGrammarFile));
    await git.add(path.join(generatedGrammarFilesFolder, generatedGrammarHTMLFile));
}

async function commitChangedJDLFiles() {
    await git.commit('Update JDL dist files');
}
