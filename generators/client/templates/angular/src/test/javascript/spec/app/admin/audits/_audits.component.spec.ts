import { ComponentFixture, TestBed, async } from '@angular/core/testing';
import { DatePipe } from '@angular/common';
import { NgbPaginationConfig} from '@ng-bootstrap/ng-bootstrap';
import { ParseLinks } from 'ng-jhipster';
import { <%=angular2AppName%>TestModule } from '../../../test.module';
import { PaginationConfig } from '../../../../../../main/webapp/app/blocks/config/uib-pagination.config'
import { AuditsComponent } from '../../../../../../main/webapp/app/admin/audits/audits.component';
import { AuditsService } from '../../../../../../main/webapp/app/admin/audits/audits.service';
import { ITEMS_PER_PAGE } from '../../../../../../main/webapp/app/shared';


describe('Component Tests', () => {

    describe('AuditsComponent', () => {

        let comp: AuditsComponent;
        let fixture: ComponentFixture<AuditsComponent>;
        let service: AuditsService;

        beforeEach(async(() => {
            TestBed.configureTestingModule({
                imports: [<%=angular2AppName%>TestModule],
                declarations: [AuditsComponent],
                providers: [
                    AuditsService,
                    NgbPaginationConfig,
                    ParseLinks,
                    PaginationConfig,
                    DatePipe
                ]
            })
            .overrideComponent(AuditsComponent, {
                set: {
                    template: ''
                }
            })
            .compileComponents();
        }));

        beforeEach(() => {
            fixture = TestBed.createComponent(AuditsComponent);
            comp = fixture.componentInstance;
            service = fixture.debugElement.injector.get(AuditsService);
        });

        describe('today function ', () => {
            it('should set toDate to current date', () => {
               let today: Date = new Date();
               let date = `${today.getFullYear()}-${today.getMonth()}-${today.getDate()}`;
               comp.previousMonth();
               expect(comp.fromDate).toBe(date);
            });
        });

        describe('By default, on loading', () => {
            it('should set all default values correctly', () => {
               let today: Date = new Date();
               let toDate = `${today.getFullYear()}-${today.getMonth() + 1}-${today.getDate() + 1}`;
               let fromDate = `${today.getFullYear()}-${today.getMonth()}-${today.getDate()}`;
               fixture.detectChanges();
               expect(comp.toDate).toBe(toDate);
               expect(comp.fromDate).toBe(fromDate);
               expect(comp.itemsPerPage).toBe(ITEMS_PER_PAGE);
               expect(comp.page).toBe(1);
               expect(comp.reverse).toBeFalsy();
               expect(comp.orderProp).toBe('timestamp');
            });
        });
    });
});
