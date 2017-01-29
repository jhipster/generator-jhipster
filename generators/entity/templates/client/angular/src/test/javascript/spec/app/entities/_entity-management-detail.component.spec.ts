import { ComponentFixture, TestBed, async, inject } from '@angular/core/testing';
import { MockBackend } from '@angular/http/testing';
import { Http, BaseRequestOptions } from '@angular/http';
import { OnInit } from '@angular/core';
import { DatePipe } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { Observable } from 'rxjs/Rx';
import { JhiLanguageService, DateUtils } from 'ng-jhipster';

import { MockLanguageService } from '../../../helpers/language.service';
import { MockActivatedRoute } from '../../../helpers/activated-route.service';
import { <%= entityAngularJSName %>DetailComponent } from '../../../../../../main/webapp/app/entities/bank-account/bank-account-detail.component';
import { <%= entityClass %>Service } from '../../../../../../main/webapp/app/entities/bank-account/bank-account.service';
import { <%= entityClass %> } from '../../../../../../main/webapp/app/entities/bank-account/bank-account.model';

describe('Component Tests', () => {

    describe('<%= entityClass %> Management Detail Component', () => {
        let comp: <%= entityAngularJSName %>DetailComponent;
        let fixture: ComponentFixture<<%= entityAngularJSName %>DetailComponent>;
        let service: <%= entityClass %>Service;

        beforeEach(async(() => {
            TestBed.configureTestingModule({
                declarations: [<%= entityAngularJSName %>DetailComponent],
                providers: [
                    MockBackend,
                    BaseRequestOptions,
                    DateUtils,
                    DatePipe,
                    {
                        provide: ActivatedRoute,
                        useClass: MockActivatedRoute
                    },
                    {
                        provide: Http,
                        useFactory: (backendInstance: MockBackend, defaultOptions: BaseRequestOptions) => {
                            return new Http(backendInstance, defaultOptions);
                        },
                        deps: [MockBackend, BaseRequestOptions]
                    },
                    {
                        provide: JhiLanguageService,
                        useClass: MockLanguageService
                    },
                    <%= entityClass %>Service
                ]
            }).overrideComponent(<%= entityAngularJSName %>DetailComponent, {
                set: {
                    template: ''
                }
            }).compileComponents();
        }));

        beforeEach(() => {
            fixture = TestBed.createComponent(<%= entityAngularJSName %>DetailComponent);
            comp = fixture.componentInstance;
            service = fixture.debugElement.injector.get(<%= entityClass %>Service);
        });


        describe('OnInit', () => {
            it('Should call load all on init', () => {
            // GIVEN
            spyOn(service, 'find').and.returnValue(Observable.of(new <%= entityClass %>(10)));

            // WHEN
            comp.ngOnInit();

            // THEN
            expect(service.find).toHaveBeenCalledWith('entityId');
            expect(comp.<%= entityInstance %>).toEqual(jasmine.objectContaining({id: 10}));
            });
        });
    });

});
