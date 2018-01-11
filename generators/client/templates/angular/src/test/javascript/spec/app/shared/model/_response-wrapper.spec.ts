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
import { Headers } from '@angular/http';

import { ResponseWrapper } from '../../../../../../main/webapp/app/shared/model/response-wrapper.model';

describe('Response Wrapper Tests', () => {

    describe('constructor', () => {

        it('should create ResponseWrapper object with null params', () => {
            // GIVEN
            const headers: Headers = null;
            const json: any = null;
            const status = 200;
            // WHEN
            const responseWrapper: ResponseWrapper = new ResponseWrapper(headers, json, status);
            // THEN
            expect(responseWrapper).not.toBeNull();
            expect(responseWrapper.headers).toBeNull();
            expect(responseWrapper.json).toBeNull();
            expect(responseWrapper.status).toEqual(200);
        });

    });
});
