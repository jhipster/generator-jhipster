import { Component, DebugElement } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { FaIconComponent, FaIconLibrary } from '@fortawesome/angular-fontawesome';
import { fas, faSort, faSortDown, faSortUp } from '@fortawesome/free-solid-svg-icons';

import { SortByDirective } from './sort-by.directive';
import { SortDirective } from './sort.directive';

@Component({
  template: `
    <table>
      <thead>
        <tr jhiSort [(predicate)]="predicate" [(ascending)]="ascending" (sortChange)="transition($event)">
          <th jhiSortBy="name">ID<fa-icon *ngIf="sortAllowed" [icon]="'sort'"></fa-icon></th>
        </tr>
      </thead>
    </table>
  `,
})
class TestSortByDirectiveComponent {
  predicate?: string;
  ascending?: boolean;
  sortAllowed = true;
  transition = jest.fn();

  constructor(library: FaIconLibrary) {
    library.addIconPacks(fas);
    library.addIcons(faSort, faSortDown, faSortUp);
  }
}

describe('Directive: SortByDirective', () => {
  let component: TestSortByDirectiveComponent;
  let fixture: ComponentFixture<TestSortByDirectiveComponent>;
  let tableHead: DebugElement;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [TestSortByDirectiveComponent, SortDirective, SortByDirective, FaIconComponent],
    });
    fixture = TestBed.createComponent(TestSortByDirectiveComponent);
    component = fixture.componentInstance;
    tableHead = fixture.debugElement.query(By.directive(SortByDirective));
  });

  it('should initialize predicate, order, icon when initial component predicate differs from column predicate', () => {
    // GIVEN
    component.predicate = 'id';
    const sortByDirective = tableHead.injector.get(SortByDirective);

    // WHEN
    fixture.detectChanges();

    // THEN
    expect(sortByDirective.jhiSortBy).toEqual('name');
    expect(component.predicate).toEqual('id');
    expect(sortByDirective.iconComponent?.icon).toEqual('sort');
    expect(component.transition).toHaveBeenCalledTimes(0);
  });

  it('should initialize predicate, order, icon when initial component predicate is same as column predicate', () => {
    // GIVEN
    component.predicate = 'name';
    component.ascending = true;
    const sortByDirective = tableHead.injector.get(SortByDirective);

    // WHEN
    fixture.detectChanges();

    // THEN
    expect(sortByDirective.jhiSortBy).toEqual('name');
    expect(component.predicate).toEqual('name');
    expect(component.ascending).toEqual(true);
    expect(sortByDirective.iconComponent?.icon).toEqual(faSortUp.iconName);
    expect(component.transition).toHaveBeenCalledTimes(0);
  });

  it('should update component predicate, order, icon when user clicks on column header', () => {
    // GIVEN
    component.predicate = 'name';
    component.ascending = true;
    const sortByDirective = tableHead.injector.get(SortByDirective);

    // WHEN
    fixture.detectChanges();
    tableHead.triggerEventHandler('click', null);
    fixture.detectChanges();

    // THEN
    expect(component.predicate).toEqual('name');
    expect(component.ascending).toEqual(false);
    expect(sortByDirective.iconComponent?.icon).toEqual(faSortDown.iconName);
    expect(component.transition).toHaveBeenCalledTimes(1);
    expect(component.transition).toHaveBeenCalledWith({ predicate: 'name', ascending: false });
  });

  it('should update component predicate, order, icon when user double clicks on column header', () => {
    // GIVEN
    component.predicate = 'name';
    component.ascending = true;
    const sortByDirective = tableHead.injector.get(SortByDirective);

    // WHEN
    fixture.detectChanges();

    tableHead.triggerEventHandler('click', null);
    fixture.detectChanges();

    tableHead.triggerEventHandler('click', null);
    fixture.detectChanges();

    // THEN
    expect(component.predicate).toEqual('name');
    expect(component.ascending).toEqual(true);
    expect(sortByDirective.iconComponent?.icon).toEqual(faSortUp.iconName);
    expect(component.transition).toHaveBeenCalledTimes(2);
    expect(component.transition).toHaveBeenNthCalledWith(1, { predicate: 'name', ascending: false });
    expect(component.transition).toHaveBeenNthCalledWith(2, { predicate: 'name', ascending: true });
  });

  it('should not run sorting on click if sorting icon is hidden', () => {
    // GIVEN
    component.predicate = 'id';
    component.ascending = false;
    component.sortAllowed = false;

    // WHEN
    fixture.detectChanges();

    tableHead.triggerEventHandler('click', null);
    fixture.detectChanges();

    // THEN
    expect(component.predicate).toEqual('id');
    expect(component.ascending).toEqual(false);
    expect(component.transition).not.toHaveBeenCalled();
  });
});
