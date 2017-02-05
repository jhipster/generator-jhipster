import { ComponentFixture, TestBed, async, inject } from '@angular/core/testing';
import { MockBackend } from '@angular/http/testing';
import { Http, BaseRequestOptions } from '@angular/http';
import { OnInit } from '@angular/core';
import { DatePipe } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { Observable } from 'rxjs/Rx';
import { DateUtils, DataUtils } from 'ng-jhipster';
<%_ if (enableTranslation) { _%>
import { JhiLanguageService } from 'ng-jhipster';
import { MockLanguageService } from '../../../helpers/mock-language.service';
<%_ } _%>
import { MockActivatedRoute } from '../../../helpers/mock-route.service';
import { <%= entityAngularJSName %>DetailComponent } from '../../../../../../main/webapp/app/entities/<%= entityFolderName %>/<%= entityFileName %>-detail.component';
import { <%= entityClass %>Service } from '../../../../../../main/webapp/app/entities/<%= entityFolderName %>/<%= entityFileName %>.service';
import { <%= entityClass %> } from '../../../../../../main/webapp/app/entities/<%= entityFolderName %>/<%= entityFileName %>.model';

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
                    DataUtils,
                    DatePipe,
                    {
                        provide: ActivatedRoute,
                        useValue: new MockActivatedRoute({id: 123})
                    },
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
                    <%_ } _%>
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
            spyOn(service, 'find').and.returnValue(Observable.of(new <%= entityClass %>(<%_
            if (databaseType == 'sql') { %>10<% } else if (databaseType == 'mongodb' || databaseType == 'cassandra') { %>'aaa'<% } %>)));

            // WHEN
            comp.ngOnInit();

            // THEN
            expect(service.find).toHaveBeenCalledWith(123);
            expect(comp.<%= entityInstance %>).toEqual(jasmine.objectContaining({id: <%_
            if (databaseType == 'sql') { %>10<% } else if (databaseType == 'mongodb' || databaseType == 'cassandra') { %>'aaa'<% } %>}));
            });
        });
    });

});
