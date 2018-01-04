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
import { ComponentFixture, TestBed, async, inject, fakeAsync, tick } from '@angular/core/testing';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { Observable } from 'rxjs/Observable';
import { JhiEventManager } from 'ng-jhipster';

import { <%=angularXAppName%>TestModule } from '../../../test.module';
import { <%= entityAngularName %>DeleteDialogComponent } from '../../../../../../main/webapp/app/entities/<%= entityFolderName %>/<%= entityFileName %>-delete-dialog.component';
import { <%= entityAngularName %>Service } from '../../../../../../main/webapp/app/entities/<%= entityFolderName %>/<%= entityFileName %>.service';

describe('Component Tests', () => {

    describe('<%= entityAngularName %> Management Delete Component', () => {
        let comp: <%= entityAngularName %>DeleteDialogComponent;
        let fixture: ComponentFixture<<%= entityAngularName %>DeleteDialogComponent>;
        let service: <%= entityAngularName %>Service;
        let mockEventManager: any;
        let mockActiveModal: any;

        beforeEach(async(() => {
            TestBed.configureTestingModule({
                imports: [<%=angularXAppName%>TestModule],
                declarations: [<%= entityAngularName %>DeleteDialogComponent],
                providers: [
                    <%= entityAngularName %>Service
                ]
            })
            .overrideTemplate(<%= entityAngularName %>DeleteDialogComponent, '')
            .compileComponents();
        }));

        beforeEach(() => {
            fixture = TestBed.createComponent(<%= entityAngularName %>DeleteDialogComponent);
            comp = fixture.componentInstance;
            service = fixture.debugElement.injector.get(<%= entityAngularName %>Service);
            mockEventManager = fixture.debugElement.injector.get(JhiEventManager);
            mockActiveModal = fixture.debugElement.injector.get(NgbActiveModal);
        });

        describe('confirmDelete', () => {
            it('Should call delete service on confirmDelete',
                inject([],
                    fakeAsync(() => {
                        // GIVEN
                        spyOn(service, 'delete').and.returnValue(Observable.of({}));

                        // WHEN
                        comp.confirmDelete(<%- tsKeyId %>);
                        tick();

                        // THEN
                        expect(service.delete).toHaveBeenCalledWith(<%- tsKeyId %>);
                        expect(mockActiveModal.dismissSpy).toHaveBeenCalled();
                        expect(mockEventManager.broadcastSpy).toHaveBeenCalled();
                    })
                )
            );
        });
    });

});
