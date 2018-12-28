import { Component, DebugElement } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';

import { JhiSortDirective, JhiSortByDirective } from '../../src/directive';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import { library } from '@fortawesome/fontawesome-svg-core';
import { faSortDown, faSortUp, faSort } from '@fortawesome/free-solid-svg-icons';
import { JhiConfigService } from '../../src/config.service';

@Component({
    template: `
    <table>
        <thead>
            <tr jhiSort [(predicate)]="predicate" [(ascending)]="reverse" [callback]="transition.bind(this)">
                <th jhiSortBy="name">ID<fa-icon [icon]="'sort'"></fa-icon></th>
            </tr>
        </thead>
    </table>
    `
})
class TestJhiSortByDirectiveComponent {
    predicate: string;
    reverse: boolean;
    transition() {
    }
}

describe('Directive: JhiSortByDirective', () => {
    let component: TestJhiSortByDirectiveComponent;
    let fixture: ComponentFixture<TestJhiSortByDirectiveComponent>;
    let tableHead: DebugElement;
    let tableRow: DebugElement;

    beforeEach(() => {
        TestBed.configureTestingModule({
            declarations: [TestJhiSortByDirectiveComponent, JhiSortDirective, JhiSortByDirective, FaIconComponent],
            providers: [JhiConfigService]
        });
        fixture = TestBed.createComponent(TestJhiSortByDirectiveComponent);
        component = fixture.componentInstance;
        tableRow = fixture.debugElement.query(By.directive(JhiSortDirective));
        tableHead = fixture.debugElement.query(By.directive(JhiSortByDirective));
        library.add(faSort, faSortDown, faSortUp);
    });

    it('should initialize predicate, order, icon when initial component predicate is _score', () => {

        // GIVEN
        spyOn(component, 'transition').and.callThrough();
        component.predicate = '_score';
        const sortDirective = tableRow.injector.get(JhiSortDirective);
        const sortByDirective = tableHead.injector.get(JhiSortByDirective);

        // WHEN
        fixture.detectChanges();

        // THEN
        expect(sortByDirective.jhiSortBy).toEqual('name');
        expect(component.predicate).toEqual('_score');
        expect(sortByDirective.iconComponent).toBeDefined();
        expect(sortByDirective.iconComponent.iconProp).toEqual('sort');
        expect(sortDirective.activeIconComponent).toBeUndefined();
        expect(component.transition).toHaveBeenCalledTimes(0);
    });

    it('should initialize predicate, order, icon when initial component predicate differs from column predicate', () => {

        // GIVEN
        spyOn(component, 'transition').and.callThrough();
        component.predicate = 'id';
        const sortDirective = tableRow.injector.get(JhiSortDirective);
        const sortByDirective = tableHead.injector.get(JhiSortByDirective);

        // WHEN
        fixture.detectChanges();

        // THEN
        expect(sortByDirective.jhiSortBy).toEqual('name');
        expect(component.predicate).toEqual('id');
        expect(sortByDirective.iconComponent).toBeDefined();
        expect(sortByDirective.iconComponent.iconProp).toEqual('sort');
        expect(sortDirective.activeIconComponent).toBeUndefined();
        expect(component.transition).toHaveBeenCalledTimes(0);
    });

    it('should initialize predicate, order, icon when initial component predicate is same as column predicate', () => {

        // GIVEN
        spyOn(component, 'transition').and.callThrough();
        component.predicate = 'name';
        component.reverse = true;
        const sortDirective = tableRow.injector.get(JhiSortDirective);
        const sortByDirective = tableHead.injector.get(JhiSortByDirective);

        // WHEN
        fixture.detectChanges();

        // THEN
        expect(sortByDirective.jhiSortBy).toEqual('name');
        expect(component.predicate).toEqual('name');
        expect(component.reverse).toEqual(true);
        expect(sortByDirective.iconComponent).toBeDefined();
        expect(sortByDirective.iconComponent.iconProp).toEqual(faSortDown);
        expect(sortDirective.activeIconComponent).toBeDefined();
        expect(sortDirective.activeIconComponent.iconProp).toEqual(faSortDown);
        expect(component.transition).toHaveBeenCalledTimes(0);
    });

    it('should initialize predicate, order, icon when initial component predicate is _score and user clicks on column header', () => {

        // GIVEN
        spyOn(component, 'transition').and.callThrough();
        component.predicate = '_score';
        component.reverse = true;
        const sortDirective = tableRow.injector.get(JhiSortDirective);
        const sortByDirective = tableHead.injector.get(JhiSortByDirective);

        // WHEN
        fixture.detectChanges();
        tableHead.triggerEventHandler('click', null);
        fixture.detectChanges();

        // THEN
        expect(sortByDirective.jhiSortBy).toEqual('name');
        expect(component.predicate).toEqual('_score');
        expect(component.reverse).toEqual(true);
        expect(sortByDirective.iconComponent).toBeDefined();
        expect(sortByDirective.iconComponent.iconProp).toEqual('sort');
        expect(sortDirective.activeIconComponent).toBeUndefined();
        expect(component.transition).toHaveBeenCalledTimes(0);
    });

    it('should update component predicate, order, icon when user clicks on column header', () => {

        // GIVEN
        spyOn(component, 'transition').and.callThrough();
        component.predicate = 'name';
        component.reverse = true;
        const sortDirective = tableRow.injector.get(JhiSortDirective);
        const sortByDirective = tableHead.injector.get(JhiSortByDirective);

        // WHEN
        fixture.detectChanges();
        tableHead.triggerEventHandler('click', null);
        fixture.detectChanges();

        // THEN
        expect(component.predicate).toEqual('name');
        expect(component.reverse).toEqual(false);
        expect(sortByDirective.iconComponent).toBeDefined();
        expect(sortByDirective.iconComponent.iconProp).toEqual(faSortUp);
        expect(sortDirective.activeIconComponent).toBeDefined();
        expect(sortDirective.activeIconComponent.iconProp).toEqual(faSortUp);
        expect(component.transition).toHaveBeenCalledTimes(1);
    });

    it('should update component predicate, order, icon when user double clicks on column header', () => {

        // GIVEN
        spyOn(component, 'transition').and.callThrough();
        component.predicate = 'name';
        component.reverse = true;
        const sortDirective = tableRow.injector.get(JhiSortDirective);
        const sortByDirective = tableHead.injector.get(JhiSortByDirective);

        // WHEN
        fixture.detectChanges();

        // WHEN
        tableHead.triggerEventHandler('click', null);
        fixture.detectChanges();

        tableHead.triggerEventHandler('click', null);
        fixture.detectChanges();

        // THEN
        expect(component.predicate).toEqual('name');
        expect(component.reverse).toEqual(true);
        expect(sortByDirective.iconComponent).toBeDefined();
        expect(sortByDirective.iconComponent.iconProp).toEqual(faSortDown);
        expect(sortDirective.activeIconComponent).toBeDefined();
        expect(sortDirective.activeIconComponent.iconProp).toEqual(faSortDown);
        expect(component.transition).toHaveBeenCalledTimes(2);
    });

});
