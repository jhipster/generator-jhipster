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
import { ComponentFixture, TestBed, inject, tick, fakeAsync } from '@angular/core/testing';
import { Observable } from 'rxjs/Observable';

import { <%=angularXAppName%>TestModule } from '../../../test.module';
import { Session } from '../../../../../../main/webapp/app/account/sessions/session.model';
import { SessionsComponent } from '../../../../../../main/webapp/app/account/sessions/sessions.component';
import { SessionsService } from '../../../../../../main/webapp/app/account/sessions/sessions.service';
import { MockPrincipal } from '../../../helpers/mock-principal.service';
import { Principal } from '../../../../../../main/webapp/app/shared/auth/principal.service';

describe('Component Tests', () => {

    let sessions: Session[];
    let fixture: ComponentFixture<SessionsComponent>;
    let comp: SessionsComponent;

    describe('SessionsComponent', function() {

        beforeEach(() => {
            sessions = [new Session('xxxxxx==', new Date(2015, 10, 15), '0:0:0:0:0:0:0:1', 'Mozilla/5.0')];

            fixture = TestBed.configureTestingModule({
                imports: [<%=angularXAppName%>TestModule],
                declarations: [SessionsComponent],
                providers: [
                    SessionsService
                ]
            })
            .overrideTemplate(SessionsComponent, '')
            .createComponent(SessionsComponent);
            comp = fixture.componentInstance;
        });

        it('should define its initial state',
            inject([Principal, SessionsService],
                fakeAsync((mockPrincipal: MockPrincipal, service: SessionsService) => {
                    mockPrincipal.spy('identity').and.returnValue(Promise.resolve({
                        id: 'fuzzer'
                    }));
                    spyOn(service, 'findAll').and.returnValue(Observable.of(sessions));

                    comp.ngOnInit();
                    tick();

                    expect(mockPrincipal.identitySpy).toHaveBeenCalled();
                    expect(service.findAll).toHaveBeenCalled();
                    expect(comp.success).toBeUndefined();
                    expect(comp.error).toBeUndefined();
                    expect(comp.account).toEqual({
                        id: 'fuzzer'
                    });
                    expect(comp.sessions).toEqual(sessions);
                })
            )
        );

        it('should call delete on Sessions to invalidate a session',
            inject([Principal, SessionsService],
                fakeAsync((mockPrincipal: MockPrincipal, service: SessionsService) => {
                    mockPrincipal.spy('identity').and.returnValue(Promise.resolve({
                        id: 'fuzzer'
                    }));
                    spyOn(service, 'findAll').and.returnValue(Observable.of(sessions));
                    spyOn(service, 'delete').and.returnValue(Observable.of({}));

                    comp.ngOnInit();
                    comp.invalidate('xyz');
                    tick();

                    expect(service.delete).toHaveBeenCalledWith('xyz');
                })
            )
        );

        it('should call delete on Sessions and notify of error',
            inject([Principal, SessionsService],
                fakeAsync((mockPrincipal: MockPrincipal, service: SessionsService) => {
                    mockPrincipal.spy('identity').and.returnValue(Promise.resolve({
                        id: 'fuzzer'
                    }));
                    spyOn(service, 'findAll').and.returnValue(Observable.of(sessions));
                    spyOn(service, 'delete').and.returnValue(Observable.of({
                        status: 400
                    }));

                    comp.ngOnInit();
                    comp.invalidate('xyz');
                    tick();

                    expect(comp.success).toBeNull();
                    expect(comp.error).toBe('ERROR');
                })
            )
        );

        it('should call notify of success upon session invalidation',
            inject([Principal, SessionsService],
                fakeAsync((mockPrincipal: MockPrincipal, service: SessionsService) => {
                    mockPrincipal.spy('identity').and.returnValue(Promise.resolve({
                        id: 'fuzzer'
                    }));
                    spyOn(service, 'findAll').and.returnValue(Observable.of(sessions));
                    spyOn(service, 'delete').and.returnValue(Observable.of({
                        status: 200
                    }));

                    comp.ngOnInit();
                    comp.invalidate('xyz');
                    tick();

                    expect(comp.error).toBeNull();
                    expect(comp.success).toBe('OK');
                })
            )
        );
    });
});
