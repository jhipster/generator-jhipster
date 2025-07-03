import { ComponentRef } from '@angular/core';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { TranslateModule } from '@ngx-translate/core';

import TranslateDirective from 'app/shared/language/translate.directive';

import ItemCountComponent from './item-count.component';

describe('ItemCountComponent test', () => {
  let comp: ItemCountComponent;
  let compRef: ComponentRef<ItemCountComponent>;
  let fixture: ComponentFixture<ItemCountComponent>;
  const inputParams = 'params';

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [ItemCountComponent, TranslateModule.forRoot(), TranslateDirective],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ItemCountComponent);
    comp = fixture.componentInstance;
    compRef = fixture.componentRef;
  });

  describe('UI logic tests', () => {
    it('should initialize with undefined', () => {
      expect(comp.first()).toBeUndefined();
      expect(comp.second()).toBeUndefined();
      expect(comp.total()).toBeUndefined();
    });

    it('should set calculated numbers to undefined if the page value is not yet defined', () => {
      // GIVEN
      compRef.setInput(inputParams, { page: undefined, totalItems: 0, itemsPerPage: 10 });

      // THEN
      expect(comp.first()).toBeUndefined();
      expect(comp.second()).toBeUndefined();
    });

    it('should change the content on page change', () => {
      // GIVEN
      compRef.setInput(inputParams, { page: 1, totalItems: 100, itemsPerPage: 10 });

      // THEN
      expect(comp.first()).toBe(1);
      expect(comp.second()).toBe(10);
      expect(comp.total()).toBe(100);

      // GIVEN
      compRef.setInput(inputParams, { page: 2, totalItems: 100, itemsPerPage: 10 });

      // THEN
      expect(comp.first()).toBe(11);
      expect(comp.second()).toBe(20);
      expect(comp.total()).toBe(100);
    });

    it('should set the second number to totalItems if this is the last page which contains less than itemsPerPage items', () => {
      // GIVEN
      compRef.setInput(inputParams, { page: 2, totalItems: 16, itemsPerPage: 10 });

      // THEN
      expect(comp.first()).toBe(11);
      expect(comp.second()).toBe(16);
      expect(comp.total()).toBe(16);
    });
  });
});
