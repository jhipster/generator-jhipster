<%#
 Copyright 2013-2017 the original author or authors from the JHipster project.

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
import { ElementRef } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { Observable } from 'rxjs/Rx';
import { JhiAlertService, JhiDateUtils, JhiDataUtils, JhiEventManager } from 'ng-jhipster';

import { MockLanguageHelper } from './../../../helpers/mock-language.service';
import { MockActivatedRoute, MockRouter } from '../../../helpers/mock-route.service';
import { <%=angularXAppName%>TestModule } from '../../../test.module';
import { MockEventManager } from '../../../helpers/mock-event-manager.service';
import { MockActiveModal } from '../../../helpers/mock-active-modal.service';
import { UserMgmtDialogComponent } from '../../../../../../main/webapp/app/admin/user-management/user-management-dialog.component';
import { UserService, User, JhiLanguageHelper } from '../../../../../../main/webapp/app/shared';

describe('Component Tests', () => {

    describe('User Management Dialog Component', () => {
        let comp: UserMgmtDialogComponent;
        let fixture: ComponentFixture<UserMgmtDialogComponent>;
        let service: UserService;
        let mockEventManager: any;
        let mockActiveModal: any;
        let mockLanguageHelper: any;

        beforeEach(async(() => {
            TestBed.configureTestingModule({
                imports: [<%=angularXAppName%>TestModule],
                declarations: [UserMgmtDialogComponent],
                providers: [
                    JhiDataUtils,
                    JhiDateUtils,
                    UserService,
                    {
                        provide: JhiAlertService,
                        useValue: null
                    },
                    {
                        provide: ActivatedRoute,
                        useValue: new MockActivatedRoute({id: 123})
                    },
                    {
                        provide: Router,
                        useValue: new MockRouter()
                    },
                    {
                        provide: JhiEventManager,
                        useClass:  MockEventManager
                    },
                    {
                        provide: JhiLanguageHelper,
                        useClass: MockLanguageHelper
                    },
                    {
                        provide: NgbActiveModal,
                        useClass: MockActiveModal
                    },
                    {
                        provide: ElementRef,
                        useValue: null
                    }
                ]
            })
            .overrideTemplate(UserMgmtDialogComponent, '')
            .compileComponents();
        }));

        beforeEach(() => {
            fixture = TestBed.createComponent(UserMgmtDialogComponent);
            comp = fixture.componentInstance;
            service = fixture.debugElement.injector.get(UserService);
            mockEventManager = fixture.debugElement.injector.get(JhiEventManager);
            mockActiveModal = fixture.debugElement.injector.get(NgbActiveModal);
            mockLanguageHelper = fixture.debugElement.injector.get(JhiLanguageHelper);
        });

        describe('OnInit', () => {
            it('Should load authorities and language on init',
                inject([],
                    fakeAsync(() => {
                        // GIVEN
                        spyOn(service, 'authorities').and.returnValue(Observable.of(['USER']));

                        // WHEN
                        comp.ngOnInit();

                        // THEN
                        expect(service.authorities).toHaveBeenCalled();
                        expect(comp.authorities).toEqual(['USER']);
                        expect(mockLanguageHelper.getAllSpy).toHaveBeenCalled();
                    })
                )
            );
        });

        describe('save', () => {
            it('Should call update service on save for existing user',
                inject([],
                    fakeAsync(() => {
                        // GIVEN
                        const entity = new User(<%= generateTestEntityIdForDB(databaseType) %>);
                        spyOn(service, 'update').and.returnValue(Observable.of(entity));
                        comp.user = entity;
                        // WHEN
                        comp.save();
                        tick(); // simulate async

                        // THEN
                        expect(service.update).toHaveBeenCalledWith(entity);
                        expect(comp.isSaving).toEqual(false);
                        expect(mockEventManager.broadcastSpy).toHaveBeenCalledWith({ name: 'userListModification', content: 'OK'});
                        expect(mockActiveModal.dismissSpy).toHaveBeenCalled();
                    })
                )
            );

            it('Should call create service on save for new user',
                inject([],
                    fakeAsync(() => {
                        // GIVEN
                        const entity = new User();
                        spyOn(service, 'create').and.returnValue(Observable.of(entity));
                        comp.user = entity;
                        // WHEN
                        comp.save();
                        tick(); // simulate async

                        // THEN
                        expect(service.create).toHaveBeenCalledWith(entity);
                        expect(comp.isSaving).toEqual(false);
                        expect(mockEventManager.broadcastSpy).toHaveBeenCalledWith({ name: 'userListModification', content: 'OK'});
                        expect(mockActiveModal.dismissSpy).toHaveBeenCalled();
                    })
                )
            );
        });
    });

});
