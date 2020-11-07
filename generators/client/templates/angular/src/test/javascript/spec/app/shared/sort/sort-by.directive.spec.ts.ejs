import { Component, DebugElement } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { FaIconComponent, FaIconLibrary } from '@fortawesome/angular-fontawesome';
import { fas, faSort, faSortDown, faSortUp } from '@fortawesome/free-solid-svg-icons';

import { JhiConfigService } from '../../src/config.service';
import { JhiSortByDirective, JhiSortDirective } from '../../src/directive';

@Component({
    template: `
        <table>
            <thead>
                <tr jhiSort [(predicate)]="predicate" [(ascending)]="ascending" [callback]="transition.bind(this)">
                    <th jhiSortBy="name">ID<fa-icon [icon]="'sort'"></fa-icon></th>
                </tr>
            </thead>
        </table>
    `
})
class TestJhiSortByDirectiveComponent {
    predicate: string;
    ascending: boolean;
    constructor(library: FaIconLibrary) {
        library.addIconPacks(fas);
        library.addIcons(faSort, faSortDown, faSortUp);
    }
    transition() {}
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
        expect(sortByDirective.iconComponent.icon).toEqual('sort');
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
        expect(sortByDirective.iconComponent.icon).toEqual('sort');
        expect(sortDirective.activeIconComponent).toBeUndefined();
        expect(component.transition).toHaveBeenCalledTimes(0);
    });

    it('should initialize predicate, order, icon when initial component predicate is same as column predicate', () => {
        // GIVEN
        spyOn(component, 'transition').and.callThrough();
        component.predicate = 'name';
        component.ascending = true;
        const sortDirective = tableRow.injector.get(JhiSortDirective);
        const sortByDirective = tableHead.injector.get(JhiSortByDirective);

        // WHEN
        fixture.detectChanges();

        // THEN
        expect(sortByDirective.jhiSortBy).toEqual('name');
        expect(component.predicate).toEqual('name');
        expect(component.ascending).toEqual(true);
        expect(sortByDirective.iconComponent).toBeDefined();
        expect(sortByDirective.iconComponent.icon).toEqual(faSortUp.iconName);
        expect(sortDirective.activeIconComponent).toBeDefined();
        expect(sortDirective.activeIconComponent.icon).toEqual(faSortUp.iconName);
        expect(component.transition).toHaveBeenCalledTimes(0);
    });

    it('should initialize predicate, order, icon when initial component predicate is _score and user clicks on column header', () => {
        // GIVEN
        spyOn(component, 'transition').and.callThrough();
        component.predicate = '_score';
        component.ascending = true;
        const sortDirective = tableRow.injector.get(JhiSortDirective);
        const sortByDirective = tableHead.injector.get(JhiSortByDirective);

        // WHEN
        fixture.detectChanges();
        tableHead.triggerEventHandler('click', null);
        fixture.detectChanges();

        // THEN
        expect(sortByDirective.jhiSortBy).toEqual('name');
        expect(component.predicate).toEqual('_score');
        expect(component.ascending).toEqual(true);
        expect(sortByDirective.iconComponent).toBeDefined();
        expect(sortByDirective.iconComponent.icon).toEqual('sort');
        expect(sortDirective.activeIconComponent).toBeUndefined();
        expect(component.transition).toHaveBeenCalledTimes(0);
    });

    it('should update component predicate, order, icon when user clicks on column header', () => {
        // GIVEN
        spyOn(component, 'transition').and.callThrough();
        component.predicate = 'name';
        component.ascending = true;
        const sortDirective = tableRow.injector.get(JhiSortDirective);
        const sortByDirective = tableHead.injector.get(JhiSortByDirective);

        // WHEN
        fixture.detectChanges();
        tableHead.triggerEventHandler('click', null);
        fixture.detectChanges();

        // THEN
        expect(component.predicate).toEqual('name');
        expect(component.ascending).toEqual(false);
        expect(sortByDirective.iconComponent).toBeDefined();
        expect(sortByDirective.iconComponent.icon).toEqual(faSortDown.iconName);
        expect(sortDirective.activeIconComponent).toBeDefined();
        expect(sortDirective.activeIconComponent.icon).toEqual(faSortDown.iconName);
        expect(component.transition).toHaveBeenCalledTimes(1);
    });

    it('should update component predicate, order, icon when user double clicks on column header', () => {
        // GIVEN
        spyOn(component, 'transition').and.callThrough();
        component.predicate = 'name';
        component.ascending = true;
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
        expect(component.ascending).toEqual(true);
        expect(sortByDirective.iconComponent).toBeDefined();
        expect(sortByDirective.iconComponent.icon).toEqual(faSortUp.iconName);
        expect(sortDirective.activeIconComponent).toBeDefined();
        expect(sortDirective.activeIconComponent.icon).toEqual(faSortUp.iconName);
        expect(component.transition).toHaveBeenCalledTimes(2);
    });
});
