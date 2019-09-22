import { Component, DebugElement } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';

import { JhiSortDirective } from '../../src/directive/sort.directive';

@Component({
    template: `
    <table>
        <thead>
            <tr jhiSort [(predicate)]="predicate" [(ascending)]="reverse" [callback]="transition.bind(this)">
            </tr>
        </thead>
    </table>
    `
})
class TestJhiSortDirectiveComponent {
    predicate: string;
    reverse: boolean;
    transition() {
    }
}

describe('Directive: JhiSortDirective', () => {
    let component: TestJhiSortDirectiveComponent;
    let fixture: ComponentFixture<TestJhiSortDirectiveComponent>;
    let tableRow: DebugElement;

    beforeEach(() => {
        TestBed.configureTestingModule({
            declarations: [TestJhiSortDirectiveComponent, JhiSortDirective]
        });
        fixture = TestBed.createComponent(TestJhiSortDirectiveComponent);
        component = fixture.componentInstance;
        tableRow = fixture.debugElement.query(By.directive(JhiSortDirective));
    });

    it('should update predicate, order and invoke callback function', () => {

        // GIVEN
        spyOn(component, 'transition').and.callThrough();
        const sortDirective = tableRow.injector.get(JhiSortDirective);

        // WHEN
        fixture.detectChanges();
        sortDirective.sort('ID');

        // THEN
        expect(component.predicate).toEqual('ID');
        expect(component.reverse).toEqual(true);
        expect(component.transition).toHaveBeenCalled();
        expect(component.transition).toHaveBeenCalledTimes(1);
    });

    it('should change sort order to descending when same field is sorted again', () => {

        // GIVEN
        spyOn(component, 'transition').and.callThrough();
        const sortDirective = tableRow.injector.get(JhiSortDirective);

        // WHEN
        fixture.detectChanges();
        sortDirective.sort('ID');
        // sort again
        sortDirective.sort('ID');

        // THEN
        expect(component.predicate).toEqual('ID');
        expect(component.reverse).toEqual(false);
        expect(component.transition).toHaveBeenCalled();
        expect(component.transition).toHaveBeenCalledTimes(2);
    });

    it('should change sort order to ascending when different field is sorted', () => {

        // GIVEN
        spyOn(component, 'transition').and.callThrough();
        const sortDirective = tableRow.injector.get(JhiSortDirective);

        // WHEN
        fixture.detectChanges();
        sortDirective.sort('ID');
        // sort again
        sortDirective.sort('NAME');

        // THEN
        expect(component.predicate).toEqual('NAME');
        expect(component.reverse).toEqual(true);
        expect(component.transition).toHaveBeenCalled();
        expect(component.transition).toHaveBeenCalledTimes(2);
    });
});
