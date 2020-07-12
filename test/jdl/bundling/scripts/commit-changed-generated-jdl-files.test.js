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
/* eslint-disable no-unused-expressions */

const path = require('path');
const chai = require('chai');
const proxyquire = require('proxyquire').noCallThru().noPreserveCache();

const { expect } = chai;

describe('ChangedGeneratedJDLFilesCommitter', () => {
    describe('commitChangedGeneratedJDLFiles', () => {
        context('when no file has changed', () => {
            let commitCalled;
            let diffCalled;

            before(async () => {
                commitCalled = false;
                diffCalled = false;
                const gitStub = {
                    commit: () => {
                        commitCalled = true;
                    },
                    diff: () => {
                        diffCalled = true;
                        return '';
                    },
                };
                const changedGeneratedJDLFilesCommitter = proxyquire(
                    '../../../../jdl/bundling/scripts/changed-generated-jdl-files-committer',
                    {
                        'simple-git': () => gitStub,
                    }
                );
                await changedGeneratedJDLFilesCommitter.commitChangedGeneratedJDLFiles();
            });

            it('should check the diff', () => {
                expect(diffCalled).to.be.true;
            });
            it('should not commit anything', () => {
                expect(commitCalled).to.be.false;
            });
        });
        context('when individual files have changed', () => {
            [
                path.join('jdl', 'bundling', 'dist', 'jdl-core.min.js'),
                path.join('jdl', 'parsing', 'generated', 'grammar.html'),
                path.join('jdl', 'parsing', 'generated', 'generated-serialized-grammar.js'),
            ].forEach(file => {
                context(`such as ${file}`, () => {
                    let addCalled;
                    let commitCalled;
                    let diffCalled;

                    before(async () => {
                        addCalled = false;
                        commitCalled = false;
                        diffCalled = false;
                        const gitStub = {
                            add: fileName => {
                                if (fileName === file) {
                                    addCalled = true;
                                }
                            },
                            commit: () => {
                                commitCalled = true;
                            },
                            diff: fileNames => {
                                if (fileNames.includes(file)) {
                                    diffCalled = true;
                                    return 'test';
                                }
                                return '';
                            },
                        };
                        const changedGeneratedJDLFilesCommitter = proxyquire(
                            '../../../../jdl/bundling/scripts/changed-generated-jdl-files-committer',
                            {
                                'simple-git': () => gitStub,
                            }
                        );
                        await changedGeneratedJDLFilesCommitter.commitChangedGeneratedJDLFiles();
                    });

                    it('should check the diff', () => {
                        expect(diffCalled).to.be.true;
                    });
                    it('should add the dist file', () => {
                        expect(addCalled).to.be.true;
                    });
                    it('should commit it', () => {
                        expect(commitCalled).to.be.true;
                    });
                });
            });
        });
        context('when all the files have changed', () => {
            let addCalled;
            let commitCalled;
            let diffCalled;

            before(async () => {
                addCalled = false;
                commitCalled = false;
                diffCalled = false;
                const gitStub = {
                    add: () => {
                        addCalled = true;
                    },
                    commit: () => {
                        commitCalled = true;
                    },
                    diff: () => {
                        diffCalled = true;
                        return 'test';
                    },
                };
                const changedGeneratedJDLFilesCommitter = proxyquire(
                    '../../../../jdl/bundling/scripts/changed-generated-jdl-files-committer',
                    {
                        'simple-git': () => gitStub,
                    }
                );
                await changedGeneratedJDLFilesCommitter.commitChangedGeneratedJDLFiles();
            });

            it('should check the diff', () => {
                expect(diffCalled).to.be.true;
            });
            it('should add the dist file', () => {
                expect(addCalled).to.be.true;
            });
            it('should commit it', () => {
                expect(commitCalled).to.be.true;
            });
        });
    });
});
