<%#
Copyright 2013-2018 the original author or authors from the JHipster project.

This file is part of the JHipster project, see http://www.jhipster.tech/
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
-%>
import { BaseRequestOptions } from '@angular/http';

import { createRequestOption } from '../../../../../../main/webapp/app/shared/model/request-util';

describe('Request Util Tests', () => {

    describe('createRequestOption', () => {

        it('should create request without search parameters with null or undefined params', () => {
            // GIVEN
            const params = [null, undefined]
            params.forEach((req) => {
                // WHEN
                const request: BaseRequestOptions = createRequestOption(req);
                // THEN
                expect(request['params']).toBeUndefined();
            });
        });

        it('should create request without search parameters ', () => {
            // GIVEN
            // WHEN
            const request: BaseRequestOptions = createRequestOption();
            // THEN
            expect(request['params']).toBeUndefined();
        });

        it('should create request with search params without sorting', () => {
            // GIVEN
            const req = {
                page: '1',
                size: '20',
                query: 'test',
                filter: 'filter'
            }
            // WHEN
            const request: BaseRequestOptions = createRequestOption(req);
            // THEN
            expect(request['params']).toBeDefined();
            expect(request.params.get('page')).toEqual(req.page);
            expect(request.params.get('size')).toEqual(req.size);
            expect(request.params.get('query')).toEqual(req.query);
            expect(request.params.get('filter')).toEqual(req.filter);
        });

        it('should create request with search params without sorting', () => {
            // GIVEN
            const req = {
                page: '1',
                size: '20',
                query: 'test',
                filter: 'filter',
                sort: ['a']
            }
            // WHEN
            const request: BaseRequestOptions = createRequestOption(req);
            // THEN
            expect(request['params']).toBeDefined();
            expect(request.params.get('page')).toEqual(req.page);
            expect(request.params.get('size')).toEqual(req.size);
            expect(request.params.get('query')).toEqual(req.query);
            expect(request.params.get('filter')).toEqual(req.filter);
            expect(request.params.get('sort')).toEqual(req.sort[0]);
        });

    });
});
