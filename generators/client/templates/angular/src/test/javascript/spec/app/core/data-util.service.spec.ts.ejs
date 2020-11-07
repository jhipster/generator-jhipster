/*
 Copyright 2013-2020 the original author or authors from the JHipster project.

 This file is part of the JHipster project, see https://www.jhipster.tech/
 for more information.

 Licensed under the Apache License, Version 2.0 (the "License");
 you may not use this file except in compliance with the License.
 You may obtain a copy of the License at

 http://www.apache.org/licenses/LICENSE-2.0

 Unless required by applicable law or agreed to in writing, software
 distributed under the License is distributed on an "AS IS" BASIS,
 WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 See the License for the specific language governing permissions and
 limitations under the License.
 */
import { async, inject, TestBed } from '@angular/core/testing';

import { JhiDataUtils } from '../../src/service/data-util.service';

describe('Data Utils Service Test', () => {
    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [JhiDataUtils]
        });
    });

    it('should not abbreviate the text when below cutoff', inject([JhiDataUtils], (service: JhiDataUtils) => {
        expect(service.abbreviate('Hello Jhipster')).toBe('Hello Jhipster');
    }));

    it('should abbreviate the text and append ...', inject([JhiDataUtils], (service: JhiDataUtils) => {
        expect(service.abbreviate('Hello Jhipster lets test the data utils function')).toBe('Hello Jhipster ...s function');
    }));

    it('should abbreviate the text and append +++', inject([JhiDataUtils], (service: JhiDataUtils) => {
        expect(service.abbreviate('Hello Jhipster lets test the data utils function', '+++')).toBe('Hello Jhipster +++s function');
    }));

    it('should return the bytesize of the text', inject([JhiDataUtils], (service: JhiDataUtils) => {
        expect(service.byteSize('Hello Jhipster')).toBe(`10.5 bytes`);
    }));

    it('should download the csv file', inject([JhiDataUtils], (service: JhiDataUtils) => {
        const tempLink = document.createElement('a');
        jest.spyOn(tempLink, 'click');
        jest.spyOn(document, 'createElement').mockReturnValue(tempLink);
        // call downloadFile function
        // csv content:
        // ID,Name
        // 1,Toto
        const contentType = 'text/csv';
        const data = 'SUQsTmFtZQ0KMSxUb3Rv';
        const fileName = 'test-download-file.csv';
        service.downloadFile(contentType, data, fileName);
        expect(document.createElement).toHaveBeenCalledTimes(1);
        expect(document.createElement).toHaveBeenCalledWith('a');
        expect(tempLink.target).toBe('_blank');
        expect(tempLink.download).toBe('test-download-file.csv');
        expect(tempLink.click).toHaveBeenCalledTimes(1);
        expect(tempLink.click).toHaveBeenCalledWith();
    }));

    it('should return a promise that rejects with an error message when image is passed but file type is not image', async(
        inject([JhiDataUtils], (service: JhiDataUtils) => {
            const eventSake = {
                target: {
                    files: [{ type: 'text/plain' }]
                }
            };

            service
                .setFileData(eventSake, null, null, true)
                .then(
                    () => fail('Should not resolve'),
                    error => expect(error).toMatch(/^File was expected to be an image but was found to be /)
                );
        })
    ));

    it('should return a promise that resolves to the modified entity', async(
        inject([JhiDataUtils], (service: JhiDataUtils) => {
            const eventSake = {
                target: {
                    files: [new File(['file content'], 'test-file.txt')]
                }
            };

            service
                .setFileData(eventSake, {}, 'document', false)
                .then(modifiedEntity => expect(modifiedEntity).toEqual({ document: 'ZmlsZSBjb250ZW50', documentContentType: '' }));
        })
    ));

    it('should return a promise that rejects with an error message when passed event does not contain a file', async(
        inject([JhiDataUtils], (service: JhiDataUtils) => {
            service
                .setFileData(null, null, null, false)
                .then(
                    () => fail('Should not resolve'),
                    error => expect(error).toMatch(/^Base64 data was not set as file could not be extracted from passed parameter: /)
                );
        })
    ));
});
