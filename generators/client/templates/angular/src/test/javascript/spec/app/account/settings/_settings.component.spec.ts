import { ComponentFixture, TestBed, async, inject } from '@angular/core/testing';
import { MockBackend } from '@angular/http/testing';
import { Http, BaseRequestOptions } from '@angular/http';
import { Observable } from 'rxjs/Rx';
<%_ if (enableTranslation) { _%>
import { JhiLanguageService } from 'ng-jhipster';

import { JhiLanguageHelper } from '../../../../../../main/webapp/app/shared';
import { MockLanguageService } from '../../../helpers/mock-language.service';
<%_ } _%>
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
        let mockAuth: MockAccountService;
        let mockPrincipal: MockPrincipal;

        beforeEach(async(() => {
            TestBed.configureTestingModule({
                declarations: [SettingsComponent],
                providers: [
                    MockBackend,
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
                    BaseRequestOptions,
                    <%_ if (enableTranslation) { _%>
                    {
                        provide: JhiLanguageHelper,
                        useValue: null
                    },
                    {
                        provide: JhiLanguageService,
                        useClass: MockLanguageService
                    },
                    <%_ } _%>
                    {
                        provide: Http,
                        useFactory: (backendInstance: MockBackend, defaultOptions: BaseRequestOptions) => {
                            return new Http(backendInstance, defaultOptions);
                        },
                        deps: [MockBackend, BaseRequestOptions]
                    }
                ]
            }).overrideComponent(SettingsComponent, {
                set: {
                    template: ''
                }
            }).compileComponents();
        }));

        beforeEach(() => {
            fixture = TestBed.createComponent(SettingsComponent);
            comp = fixture.componentInstance;
            mockAuth = fixture.debugElement.injector.get(AccountService);
            mockPrincipal = fixture.debugElement.injector.get(Principal);
        });

        it('should send the current identity upon save', function () {
            // GIVEN
            let accountValues = {
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

        it('should notify of success upon successful save', function () {
            // GIVEN
            let accountValues = {
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

        it('should notify of error upon failed save', function () {
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
