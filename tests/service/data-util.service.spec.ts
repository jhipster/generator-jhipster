/*
 Copyright 2013-2017 the original author or authors from the JHipster project.

 This file is part of the JHipster project, see https://jhipster.github.io/
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
import { TestBed, inject } from '@angular/core/testing';

import { JhiDataUtils } from '../../src/service/data-util.service';

describe('Data Utils service test', () => {

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
            // create spy object with a click() method
            const spyObj = spyOn('a', 'click');
            // spy on document.createElement() and return the spy object
            spyOn(document, 'createElement').and.returnValue(spyObj);
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
            expect(spyObj.download).toBe('test-download-file.csv');
            expect(spyObj.click).toHaveBeenCalledTimes(1);
            expect(spyObj.click).toHaveBeenCalledWith();
        }));
    });
});
