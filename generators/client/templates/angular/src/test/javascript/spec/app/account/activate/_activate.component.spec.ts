import {ComponentFixture, TestBed, async, tick, fakeAsync} from '@angular/core/testing';
import {MockBackend} from '@angular/http/testing';
import {Http, BaseRequestOptions} from '@angular/http';
import {ActivatedRoute} from '@angular/router';
import {Observable} from 'rxjs/Rx';
<%_ if (enableTranslation) { _%>
import {JhiLanguageService} from 'ng-jhipster';
import {MockLanguageService} from "../../../helpers/language.service";
<% } %>
import {LoginModalService} from '../../../../../../main/webapp/app/shared';
import {MockActivate} from "../../../helpers/activate.service";
import {MockActivatedRoute} from "../../../helpers/routes";
import {Activate} from "../../../../../../main/webapp/app/account/activate/activate.service";
import {ActivateComponent} from "../../../../../../main/webapp/app/account/activate/activate.component";


describe('Component Tests', () => {

    describe('ActivateComponent', () => {

        let comp: ActivateComponent;
        let mockActivate: MockActivate;
        let mockActivatedRoute: MockActivatedRoute;

        beforeEach(async(() => {
            mockActivatedRoute = new MockActivatedRoute({'key': 'ABC123'});

            TestBed.configureTestingModule({
                declarations: [ActivateComponent],
                providers: [MockBackend,
                    {
                        provide: Activate,
                        useClass: MockActivate
                    },
                    BaseRequestOptions,
                    {
                        provide: Http,
                        useFactory: (backendInstance: MockBackend, defaultOptions: BaseRequestOptions) => {
                            return new Http(backendInstance, defaultOptions);
                        },
                        deps: [MockBackend, BaseRequestOptions]
                    },
                    <%_ if (enableTranslation) { _%>
                    {
                        provide: JhiLanguageService,
                        useClass: MockLanguageService
                    },
                    <% } %>
                    {
                        provide: ActivatedRoute,
                        useValue: mockActivatedRoute
                    },
                    {
                        provide: LoginModalService,
                        useValue: null
                    }
                ]
            }).overrideComponent(ActivateComponent, {
                set: {
                    template: ''
                }
            }).compileComponents();
        }));

        beforeEach(() => {
            let fixture = TestBed.createComponent(ActivateComponent);
            comp = fixture.componentInstance;
            mockActivate = fixture.debugElement.injector.get(Activate);
        });

        it('calls activate.get with the key from params', fakeAsync(() => {
            comp.ngOnInit();
            tick();

            expect(mockActivate.getSpy).toHaveBeenCalledWith('ABC123');
        }));

        it('should set set success to OK upon successful activation', fakeAsync(() => {
            comp.ngOnInit();
            tick();

            expect(comp.error).toBe(null);
            expect(comp.success).toEqual('OK');
        }));

        it('should set set error to ERROR upon activation failure', fakeAsync(() => {
            mockActivate.getSpy.and.returnValue(Observable.throw('ERROR'));

            comp.ngOnInit();
            tick();

            expect(comp.error).toBe('ERROR');
            expect(comp.success).toEqual(null);
        }));
    });
});
