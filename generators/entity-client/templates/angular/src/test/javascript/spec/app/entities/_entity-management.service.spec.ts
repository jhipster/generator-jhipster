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
import { TestBed, async } from '@angular/core/testing';
import { MockBackend } from '@angular/http/testing';
import { ConnectionBackend, RequestOptions, BaseRequestOptions, Http, Response, ResponseOptions } from '@angular/http';
import { JhiDateUtils } from 'ng-jhipster';

import { <%= entityAngularName %>Service } from '../../../../../../main/webapp/app/entities/<%= entityFolderName %>/<%= entityFileName %>.service';
import { <%= entityAngularName %> } from '../../../../../../main/webapp/app/entities/<%= entityFolderName %>/<%= entityFileName %>.model';
import { SERVER_API_URL } from '../../../../../../main/webapp/app/app.constants';

describe('Service Tests', () => {

    describe('<%= entityAngularName %> Service', () => {
        let service: <%= entityAngularName %>Service;

        beforeEach(async(() => {
            TestBed.configureTestingModule({
                providers: [
                    {
                        provide: ConnectionBackend,
                        useClass: MockBackend
                    },
                    {
                        provide: RequestOptions,
                        useClass: BaseRequestOptions
                    },
                    Http,
                    JhiDateUtils,
                    <%= entityAngularName %>Service
                ]
            });

            service = TestBed.get(<%= entityAngularName %>Service);

            this.backend = TestBed.get(ConnectionBackend) as MockBackend;
            this.backend.connections.subscribe((connection: any) => {
                this.lastConnection = connection;
            });
        }));

        describe('Service methods', () => {
            it('should call correct URL', () => {
                service.find(<%- tsKeyId %>).subscribe(() => {});

                expect(this.lastConnection).toBeDefined();

                const resourceUrl = SERVER_API_URL + '<% if (applicationType === 'gateway' && locals.microserviceName) { %>/<%= microserviceName.toLowerCase() %>/<% } %>api/<%= entityApiUrl %>';
                expect(this.lastConnection.request.url).toEqual(resourceUrl + '/' + <%- tsKeyId %>);
            });
            it('should return <%= entityAngularName %>', () => {

                let entity: <%= entityAngularName %>;
                service.find(<%- tsKeyId %>).subscribe((_entity: <%= entityAngularName %>) => {
                    entity = _entity;
                });

                this.lastConnection.mockRespond(new Response(new ResponseOptions({
                    body: JSON.stringify({id: <%- tsKeyId %>}),
                })));

                expect(entity).toBeDefined();
                expect(entity.id).toEqual(<%- tsKeyId %>);
            });

            it('should propagate not found response', () => {

                let error: any;
                service.find(<%- tsKeyId %>).subscribe(null, (_error: any) => {
                    error = _error;
                });

                this.lastConnection.mockError(new Response(new ResponseOptions({
                    status: 404,
                })));

                expect(error).toBeDefined();
                expect(error.status).toEqual(404);
            });
        });
    });

});
