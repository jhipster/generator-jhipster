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
import { ComponentFixture, TestBed, async } from '@angular/core/testing';
import { HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs/Observable';

import { <%=angularXAppName%>TestModule } from '../../../test.module';
import { <%= entityAngularName %>DetailComponent } from '../../../../../../main/webapp/app/entities/<%= entityFolderName %>/<%= entityFileName %>-detail.component';
import { <%= entityAngularName %>Service } from '../../../../../../main/webapp/app/entities/<%= entityFolderName %>/<%= entityFileName %>.service';
import { <%= entityAngularName %> } from '../../../../../../main/webapp/app/entities/<%= entityFolderName %>/<%= entityFileName %>.model';

describe('Component Tests', () => {

    describe('<%= entityAngularName %> Management Detail Component', () => {
        let comp: <%= entityAngularName %>DetailComponent;
        let fixture: ComponentFixture<<%= entityAngularName %>DetailComponent>;
        let service: <%= entityAngularName %>Service;

        beforeEach(async(() => {
            TestBed.configureTestingModule({
                imports: [<%=angularXAppName%>TestModule],
                declarations: [<%= entityAngularName %>DetailComponent],
                providers: [
                    <%= entityAngularName %>Service
                ]
            })
            .overrideTemplate(<%= entityAngularName %>DetailComponent, '')
            .compileComponents();
        }));

        beforeEach(() => {
            fixture = TestBed.createComponent(<%= entityAngularName %>DetailComponent);
            comp = fixture.componentInstance;
            service = fixture.debugElement.injector.get(<%= entityAngularName %>Service);
        });

        describe('OnInit', () => {
            it('Should call load all on init', () => {
                // GIVEN

                spyOn(service, 'find').and.returnValue(Observable.of(new HttpResponse({
                    body: new <%= entityAngularName %>(<%- tsKeyId %>)
                })));

                // WHEN
                comp.ngOnInit();

                // THEN
                expect(service.find).toHaveBeenCalledWith(<%- tsKeyId %>);
                expect(comp.<%= entityInstance %>).toEqual(jasmine.objectContaining({id: <%- tsKeyId %>}));
            });
        });
    });

});
