jest.mock('app/core/auth/account.service');

import { waitForAsync, ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { Router, TitleStrategy } from '@angular/router';
import { Title } from '@angular/platform-browser';
import { RouterTestingModule } from '@angular/router/testing';
import { DOCUMENT } from '@angular/common';
import { Component } from '@angular/core';
import { of } from 'rxjs';
import { TranslateModule, TranslateService, LangChangeEvent } from '@ngx-translate/core';

import { AccountService } from 'app/core/auth/account.service';

import { MainComponent } from './main.component';
import { AppPageTitleStrategy } from 'app/app-page-title-strategy';

describe('MainComponent', () => {
  let comp: MainComponent;
  let fixture: ComponentFixture<MainComponent>;
  let titleService: Title;
  let translateService: TranslateService;
  let mockAccountService: AccountService;
  const routerState: any = { snapshot: { root: { data: {} } } };
  let router: Router;
  let document: Document;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [TranslateModule.forRoot(), RouterTestingModule],
      declarations: [MainComponent],
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
    router = TestBed.inject(Router);
    document = TestBed.inject(DOCUMENT);
  });

  describe('page title', () => {
    const defaultPageTitle = 'global.title';
    const parentRoutePageTitle = 'parentTitle';
    const childRoutePageTitle = 'childTitle';
    const langChangeEvent: LangChangeEvent = { lang: 'en', translations: null };

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
        router.navigateByUrl('');
        tick();

        // THEN
        expect(document.title).toBe(defaultPageTitle + ' translated');
      }));

      it('should set page title to root route pageTitle if there is no child routes', fakeAsync(() => {
        // GIVEN
        router.resetConfig([{ path: '', title: parentRoutePageTitle, component: BlankComponent }]);

        // WHEN
        router.navigateByUrl('');
        tick();

        // THEN
        expect(document.title).toBe(parentRoutePageTitle + ' translated');
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
        router.navigateByUrl('home');
        tick();

        // THEN
        expect(document.title).toBe(childRoutePageTitle + ' translated');
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
        router.navigateByUrl('home');
        tick();

        // THEN
        expect(document.title).toBe(parentRoutePageTitle + ' translated');
      }));
    });

    describe('language change', () => {
      it('should set page title to default title if pageTitle is missing on routes', () => {
        // WHEN
        translateService.onLangChange.emit(langChangeEvent);

        // THEN
        expect(document.title).toBe(defaultPageTitle + ' translated');
      });

      it('should set page title to root route pageTitle if there is no child routes', fakeAsync(() => {
        // GIVEN
        routerState.snapshot.root.data = { pageTitle: parentRoutePageTitle };
        router.resetConfig([{ path: '', title: parentRoutePageTitle, component: BlankComponent }]);

        // WHEN
        router.navigateByUrl('');
        tick();

        // THEN
        expect(document.title).toBe(parentRoutePageTitle + ' translated');

        // GIVEN
        document.title = 'other title';

        // WHEN
        translateService.onLangChange.emit(langChangeEvent);

        // THEN
        expect(document.title).toBe(parentRoutePageTitle + ' translated');
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
        router.navigateByUrl('home');
        tick();

        // THEN
        expect(document.title).toBe(childRoutePageTitle + ' translated');

        // GIVEN
        document.title = 'other title';

        // WHEN
        translateService.onLangChange.emit(langChangeEvent);

        // THEN
        expect(document.title).toBe(childRoutePageTitle + ' translated');
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
        router.navigateByUrl('home');
        tick();

        // THEN
        expect(document.title).toBe(parentRoutePageTitle + ' translated');

        // GIVEN
        document.title = 'other title';

        // WHEN
        translateService.onLangChange.emit(langChangeEvent);

        // THEN
        expect(document.title).toBe(parentRoutePageTitle + ' translated');
      }));
    });
  });

  describe('page language attribute', () => {
    it('should change page language attribute on language change', () => {
      // GIVEN
      comp.ngOnInit();

      // WHEN
      translateService.onLangChange.emit({ lang: 'lang1', translations: null });

      // THEN
      expect(document.querySelector('html')?.getAttribute('lang')).toEqual('lang1');

      // WHEN
      translateService.onLangChange.emit({ lang: 'lang2', translations: null });

      // THEN
      expect(document.querySelector('html')?.getAttribute('lang')).toEqual('lang2');
    });
  });
});

@Component({ template: '' })
export class BlankComponent {}
