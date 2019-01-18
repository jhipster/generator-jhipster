/*
 Copyright 2013-2019 the original author or authors from the JHipster project.

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
import { fakeAsync, flush, inject, TestBed } from '@angular/core/testing';

import { JhiDataUtils } from '../../src/service/data-util.service';

describe('Data Utils Service Test', () => {
    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [
                JhiDataUtils
            ]
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

    it('should execute the toBase64()', fakeAsync(() => inject([JhiDataUtils], (service: JhiDataUtils) => {

        jest.spyOn(service, 'toBase64');

        const eventSake = {
            target: {
                files: [new Blob()]
            }
        };
        service.setFileData(eventSake, null, null, false);

        flush();

        expect(service.toBase64).toHaveBeenCalled();
    })()));

    it('should not call toBase64() when image is passed and file type is not image', (done) => inject([JhiDataUtils], (service: JhiDataUtils) => {

        jest.spyOn(service, 'toBase64');
        const mockSuccessCallback = jest.fn(() => {
        });
        const mockErrorCallback = jest.fn(() => {
            expect(mockSuccessCallback.mock.calls.length).toBe(0);
            expect(mockErrorCallback.mock.calls.length).toBe(1);
            expect(service.toBase64).toHaveBeenCalledTimes(0);
            done();
        });

        const eventSake = {
            target: {
                files: [{}]
            }
        };

        service.setFileData(eventSake, null, null, true, mockSuccessCallback, mockErrorCallback);

    })());

    it('should execute the callback in toBase64()', (done) => inject([JhiDataUtils], (service: JhiDataUtils) => {
        const entity = {};
        const mockSuccessCallback = jest.fn((arg) => {
            const modifiedEntity = { document: 'ZmlsZSBjb250ZW50', documentContentType: '' };
            expect(mockSuccessCallback.mock.calls.length).toBe(1);
            expect(mockSuccessCallback.mock.calls[0][0]).toEqual(modifiedEntity);
            expect(arg).toEqual(modifiedEntity);
            expect(entity).toEqual(modifiedEntity);
            done();
        });

        const eventSake = {
            target: {
                files: [new File(['file content'], 'test-file.txt')]
            }
        };

        service.setFileData(eventSake, entity, 'document', false, mockSuccessCallback);

    })());

});
