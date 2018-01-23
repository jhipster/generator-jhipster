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
<%_
const tsKeyId = generateTestEntityId(pkType, prodDatabaseType);
_%>
/* tslint:disable max-line-length */
import { TestBed, getTestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { JhiDateUtils } from 'ng-jhipster';

import { <%= entityAngularName %>Service } from '../../../../../../main/webapp/app/entities/<%= entityFolderName %>/<%= entityFileName %>.service';
import { SERVER_API_URL } from '../../../../../../main/webapp/app/app.constants';

describe('Service Tests', () => {

    describe('<%= entityAngularName %> Service', () => {
        let injector: TestBed;
        let service: <%= entityAngularName %>Service;
        let httpMock: HttpTestingController;

        beforeEach(() => {
            TestBed.configureTestingModule({
                imports: [
                    HttpClientTestingModule
                ],
                providers: [
                    JhiDateUtils,
                    <%= entityAngularName %>Service
                ]
            });
            injector = getTestBed();
            service = injector.get(<%= entityAngularName %>Service);
            httpMock = injector.get(HttpTestingController);
        });

        describe('Service methods', () => {
            it('should call correct URL', () => {
                service.find(<%- tsKeyId %>).subscribe(() => {});

                const req  = httpMock.expectOne({ method: 'GET' });

                const resourceUrl = SERVER_API_URL + '<% if (applicationType === 'gateway' && locals.microserviceName) { %>/<%= microserviceName.toLowerCase() %>/<% } %>api/<%= entityApiUrl %>';
                expect(req.request.url).toEqual(resourceUrl + '/' + <%- tsKeyId %>);
            });
            it('should return <%= entityAngularName %>', () => {

                service.find(<%- tsKeyId %>).subscribe((received) => {
                    expect(received.body.id).toEqual(<%- tsKeyId %>);
                });

                const req = httpMock.expectOne({ method: 'GET' });
                req.flush({id: <%- tsKeyId %>});
            });

            it('should propagate not found response', () => {

                service.find(<%- tsKeyId %>).subscribe(null, (_error: any) => {
                    expect(_error.status).toEqual(404);
                });

                const req  = httpMock.expectOne({ method: 'GET' });
                req.flush('Invalid request parameters', {
                    status: 404, statusText: 'Bad Request'
                });

            });
        });

        afterEach(() => {
            httpMock.verify();
        });

    });

});
