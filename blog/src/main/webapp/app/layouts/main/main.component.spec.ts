jest.mock('app/core/auth/account.service');

import { ComponentFixture, TestBed, fakeAsync, tick, waitForAsync } from '@angular/core/testing';
import { Router, TitleStrategy } from '@angular/router';
import { Title } from '@angular/platform-browser';
import { DOCUMENT } from '@angular/common';
import { Component, NgZone } from '@angular/core';
import { of } from 'rxjs';
import { InterpolatableTranslationObject, LangChangeEvent, TranslateModule, TranslateService } from '@ngx-translate/core';

import { AccountService } from 'app/core/auth/account.service';

import { AppPageTitleStrategy } from 'app/app-page-title-strategy';
import MainComponent from './main.component';

describe('MainComponent', () => {
  let comp: MainComponent;
  let fixture: ComponentFixture<MainComponent>;
  let titleService: Title;
  let translateService: TranslateService;
  let mockAccountService: AccountService;
  let ngZone: NgZone;
  const routerState: any = { snapshot: { root: { data: {} } } };
  let router: Router;
  let document: Document;

  const navigateByUrlFn = (url: string) => () => router.navigateByUrl(url);

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [TranslateModule.forRoot(), MainComponent],
      providers: [Title, AccountService, { provide: TitleStrategy, useClass: AppPageTitleStrategy }],
    })
      .overrideTemplate(MainComponent, '')
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MainComponent);
    comp = fixture.componentInstance;
    titleService = TestBed.inject(Title);
    translateService = TestBed.inject(TranslateService);
    mockAccountService = TestBed.inject(AccountService);
    mockAccountService.identity = jest.fn(() => of(null));
    mockAccountService.getAuthenticationState = jest.fn(() => of(null));
    ngZone = TestBed.inject(NgZone);
    router = TestBed.inject(Router);
    document = TestBed.inject(DOCUMENT);
  });

  describe('page title', () => {
    const defaultPageTitle = 'global.title';
    const parentRoutePageTitle = 'parentTitle';
    const childRoutePageTitle = 'childTitle';
    const langChangeEvent: LangChangeEvent = { lang: 'en', translations: {} as InterpolatableTranslationObject };

    beforeEach(() => {
      routerState.snapshot.root = { data: {} };
      jest.spyOn(translateService, 'get').mockImplementation((key: string | string[]) => of(`${key as string} translated`));
      translateService.currentLang = 'en';
      jest.spyOn(titleService, 'setTitle');
      comp.ngOnInit();
    });

    describe('navigation end', () => {
      it('should set page title to default title if pageTitle is missing on routes', fakeAsync(() => {
        // WHEN
        ngZone.run(navigateByUrlFn(''));
        tick();

        // THEN
        expect(document.title).toBe(`${defaultPageTitle} translated`);
      }));

      it('should set page title to root route pageTitle if there is no child routes', fakeAsync(() => {
        // GIVEN
        router.resetConfig([{ path: '', title: parentRoutePageTitle, component: BlankComponent }]);

        // WHEN
        ngZone.run(navigateByUrlFn(''));
        tick();

        // THEN
        expect(document.title).toBe(`${parentRoutePageTitle} translated`);
      }));

      it('should set page title to child route pageTitle if child routes exist and pageTitle is set for child route', fakeAsync(() => {
        // GIVEN
        router.resetConfig([
          {
            path: 'home',
            title: parentRoutePageTitle,
            children: [{ path: '', title: childRoutePageTitle, component: BlankComponent }],
          },
        ]);

        // WHEN
        ngZone.run(navigateByUrlFn('home'));
        tick();

        // THEN
        expect(document.title).toBe(`${childRoutePageTitle} translated`);
      }));

      it('should set page title to parent route pageTitle if child routes exists but pageTitle is not set for child route data', fakeAsync(() => {
        // GIVEN
        router.resetConfig([
          {
            path: 'home',
            title: parentRoutePageTitle,
            children: [{ path: '', component: BlankComponent }],
          },
        ]);

        // WHEN
        ngZone.run(navigateByUrlFn('home'));
        tick();

        // THEN
        expect(document.title).toBe(`${parentRoutePageTitle} translated`);
      }));
    });

    describe('language change', () => {
      it('should set page title to default title if pageTitle is missing on routes', () => {
        // WHEN
        translateService.onLangChange.emit(langChangeEvent);

        // THEN
        expect(document.title).toBe(`${defaultPageTitle} translated`);
      });

      it('should set page title to root route pageTitle if there is no child routes', fakeAsync(() => {
        // GIVEN
        routerState.snapshot.root.data = { pageTitle: parentRoutePageTitle };
        router.resetConfig([{ path: '', title: parentRoutePageTitle, component: BlankComponent }]);

        // WHEN
        ngZone.run(navigateByUrlFn(''));
        tick();

        // THEN
        expect(document.title).toBe(`${parentRoutePageTitle} translated`);

        // GIVEN
        document.title = 'other title';

        // WHEN
        translateService.onLangChange.emit(langChangeEvent);

        // THEN
        expect(document.title).toBe(`${parentRoutePageTitle} translated`);
      }));

      it('should set page title to child route pageTitle if child routes exist and pageTitle is set for child route', fakeAsync(() => {
        // GIVEN
        router.resetConfig([
          {
            path: 'home',
            title: parentRoutePageTitle,
            children: [{ path: '', title: childRoutePageTitle, component: BlankComponent }],
          },
        ]);

        // WHEN
        ngZone.run(navigateByUrlFn('home'));
        tick();

        // THEN
        expect(document.title).toBe(`${childRoutePageTitle} translated`);

        // GIVEN
        document.title = 'other title';

        // WHEN
        translateService.onLangChange.emit(langChangeEvent);

        // THEN
        expect(document.title).toBe(`${childRoutePageTitle} translated`);
      }));

      it('should set page title to parent route pageTitle if child routes exists but pageTitle is not set for child route data', fakeAsync(() => {
        // GIVEN
        router.resetConfig([
          {
            path: 'home',
            title: parentRoutePageTitle,
            children: [{ path: '', component: BlankComponent }],
          },
        ]);

        // WHEN
        ngZone.run(navigateByUrlFn('home'));
        tick();

        // THEN
        expect(document.title).toBe(`${parentRoutePageTitle} translated`);

        // GIVEN
        document.title = 'other title';

        // WHEN
        translateService.onLangChange.emit(langChangeEvent);

        // THEN
        expect(document.title).toBe(`${parentRoutePageTitle} translated`);
      }));
    });
  });

  describe('page language attribute', () => {
    it('should change page language attribute on language change', () => {
      // GIVEN
      comp.ngOnInit();

      // WHEN
      translateService.onLangChange.emit({ lang: 'lang1', translations: {} as InterpolatableTranslationObject });

      // THEN
      expect(document.querySelector('html')?.getAttribute('lang')).toEqual('lang1');

      // WHEN
      translateService.onLangChange.emit({ lang: 'lang2', translations: {} as InterpolatableTranslationObject });

      // THEN
      expect(document.querySelector('html')?.getAttribute('lang')).toEqual('lang2');
    });
  });
});

@Component({
  template: '',
})
export class BlankComponent {}
