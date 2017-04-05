import { ComponentFixture, TestBed, async, inject } from '@angular/core/testing';
import { OnInit } from '@angular/core';
import { DatePipe } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { Observable } from 'rxjs/Rx';
import { DateUtils, DataUtils, EventManager } from 'ng-jhipster';
import { <%=angular2AppName%>TestModule } from '../../../test.module';
import { MockActivatedRoute } from '../../../helpers/mock-route.service';
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
                imports: [<%=angular2AppName%>TestModule],
                declarations: [<%= entityAngularName %>DetailComponent],
                providers: [
                    DateUtils,
                    DataUtils,
                    DatePipe,
                    {
                        provide: ActivatedRoute,
                        useValue: new MockActivatedRoute({id: 123})
                    },
                    <%= entityAngularName %>Service,
                    EventManager
                ]
            }).overrideComponent(<%= entityAngularName %>DetailComponent, {
                set: {
                    template: ''
                }
            }).compileComponents();
        }));

        beforeEach(() => {
            fixture = TestBed.createComponent(<%= entityAngularName %>DetailComponent);
            comp = fixture.componentInstance;
            service = fixture.debugElement.injector.get(<%= entityAngularName %>Service);
        });


        describe('OnInit', () => {
            it('Should call load all on init', () => {
            // GIVEN

            spyOn(service, 'find').and.returnValue(Observable.of(new <%= entityAngularName %>(<%_
            if (databaseType === 'sql' || databaseType === 'no') { %>10<% } else if (databaseType === 'mongodb' || databaseType === 'cassandra') { %>'aaa'<% } %>)));

            // WHEN
            comp.ngOnInit();

            // THEN
            expect(service.find).toHaveBeenCalledWith(123);
            expect(comp.<%= entityInstance %>).toEqual(jasmine.objectContaining({id: <%_
            if (databaseType === 'sql' || databaseType === 'no') { %>10<% } else if (databaseType === 'mongodb' || databaseType === 'cassandra') { %>'aaa'<% } %>}));
            });
        });
    });

});
