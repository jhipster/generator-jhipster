<%#
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
-%>
import { ComponentFixture, TestBed, async } from '@angular/core/testing';
import { Observable } from 'rxjs/Rx';
<%_ if (enableTranslation) { _%>
import { JhiLanguageHelper } from '../../../../../../main/webapp/app/shared';
<%_ } _%>
import { <%=angularXAppName%>TestModule } from '../../../test.module';
import { Principal, AccountService } from '../../../../../../main/webapp/app/shared';
import { SettingsComponent } from '../../../../../../main/webapp/app/account/settings/settings.component';
import { MockAccountService } from '../../../helpers/mock-account.service';
import { MockPrincipal } from '../../../helpers/mock-principal.service';
<%_ if (websocket === 'spring-websocket') { _%>
import { <%=jhiPrefixCapitalized%>TrackerService } from '../../../../../../main/webapp/app/shared/tracker/tracker.service';
import { MockTrackerService } from '../../../helpers/mock-tracker.service';
<%_ } _%>

describe('Component Tests', () => {

    describe('SettingsComponent', () => {

        let comp: SettingsComponent;
        let fixture: ComponentFixture<SettingsComponent>;
        let mockAuth: any;
        let mockPrincipal: any;

        beforeEach(async(() => {
            TestBed.configureTestingModule({
                imports: [<%=angularXAppName%>TestModule],
                declarations: [SettingsComponent],
                providers: [
                    {
                        provide: Principal,
                        useClass: MockPrincipal
                    },
                    {
                        provide: AccountService,
                        useClass: MockAccountService
                    },
                    <%_ if (websocket === 'spring-websocket') { _%>
                    {
                        provide: <%=jhiPrefixCapitalized%>TrackerService,
                        useClass: MockTrackerService
                    },
                    <%_ } _%>
                    <%_ if (enableTranslation) { _%>
                    {
                        provide: JhiLanguageHelper,
                        useValue: null
                    },
                    <%_ } _%>
                ]
            }).overrideTemplate(SettingsComponent, '')
            .compileComponents();
        }));

        beforeEach(() => {
            fixture = TestBed.createComponent(SettingsComponent);
            comp = fixture.componentInstance;
            mockAuth = fixture.debugElement.injector.get(AccountService);
            mockPrincipal = fixture.debugElement.injector.get(Principal);
        });

        it('should send the current identity upon save', () => {
            // GIVEN
            const accountValues = {
                firstName: 'John',
                lastName: 'Doe',

                activated: true,
                email: 'john.doe@mail.com',
                langKey: '<%= nativeLanguage %>',
                login: 'john'
            };
            mockPrincipal.setResponse(accountValues);

            // WHEN
            comp.settingsAccount = accountValues;
            comp.save();

            // THEN
            expect(mockPrincipal.identitySpy).toHaveBeenCalled();
            expect(mockAuth.saveSpy).toHaveBeenCalledWith(accountValues);
            expect(comp.settingsAccount).toEqual(accountValues);
        });

        it('should notify of success upon successful save', () => {
            // GIVEN
            const accountValues = {
                firstName: 'John',
                lastName: 'Doe'
            };
            mockPrincipal.setResponse(accountValues);

            // WHEN
            comp.save();

            // THEN
            expect(comp.error).toBeNull();
            expect(comp.success).toBe('OK');
        });

        it('should notify of error upon failed save', () => {
            // GIVEN
            mockAuth.saveSpy.and.returnValue(Observable.throw('ERROR'));

            // WHEN
            comp.save();

            // THEN
            expect(comp.error).toEqual('ERROR');
            expect(comp.success).toBeNull();
        });
    });
});
