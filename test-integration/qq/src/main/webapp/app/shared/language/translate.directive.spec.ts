import { Component } from '@angular/core';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

import { TranslateDirective } from './translate.directive';

@Component({
  template: ` <div jhiTranslate="test"></div> `,
})
class TestTranslateDirectiveComponent {}

describe('TranslateDirective Tests', () => {
  let fixture: ComponentFixture<TestTranslateDirectiveComponent>;
  let translateService: TranslateService;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [TranslateModule.forRoot()],
      declarations: [TranslateDirective, TestTranslateDirectiveComponent],
    });
  }));

  beforeEach(() => {
    translateService = TestBed.inject(TranslateService);
    fixture = TestBed.createComponent(TestTranslateDirectiveComponent);
  });

  it('should change HTML', () => {
    const spy = jest.spyOn(translateService, 'get');

    fixture.detectChanges();

    expect(spy).toHaveBeenCalled();
  });
});
