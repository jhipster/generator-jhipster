import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { Router, RouterEvent, NavigationEnd } from '@angular/router';
import { Title } from '@angular/platform-browser';
import { Subject } from 'rxjs';

import { MainComponent } from 'app/layouts/main/main.component';
import { TestModule } from '../../../test.module';
import { MockRouter } from '../../../helpers/mock-route.service';

describe('Component Tests', () => {
  describe('MainComponent', () => {
    let comp: MainComponent;
    let fixture: ComponentFixture<MainComponent>;
    let router: MockRouter;
    const routerEventsSubject = new Subject<RouterEvent>();
    let titleService: Title;

    beforeEach(async(() => {
      TestBed.configureTestingModule({
        imports: [TestModule],
        declarations: [MainComponent],
        providers: [Title],
      })
        .overrideTemplate(MainComponent, '')
        .compileComponents();
    }));

    beforeEach(() => {
      fixture = TestBed.createComponent(MainComponent);
      comp = fixture.componentInstance;
      router = TestBed.get(Router);
      router.setEvents(routerEventsSubject.asObservable());
      titleService = TestBed.get(Title);
    });

    describe('page title', () => {
      let routerState: any;
      const defaultPageTitle = 'Sandraapp';
      const parentRoutePageTitle = 'parentTitle';
      const childRoutePageTitle = 'childTitle';
      const navigationEnd = new NavigationEnd(1, '', '');

      beforeEach(() => {
        routerState = { snapshot: { root: {} } };
        router.setRouterState(routerState);
        spyOn(titleService, 'setTitle');
        comp.ngOnInit();
      });

      describe('navigation end', () => {
        it('should set page title to default title if pageTitle is missing on routes', () => {
          // WHEN
          routerEventsSubject.next(navigationEnd);

          // THEN
          expect(titleService.setTitle).toHaveBeenCalledWith(defaultPageTitle);
        });

        it('should set page title to root route pageTitle if there is no child routes', () => {
          // GIVEN
          routerState.snapshot.root.data = { pageTitle: parentRoutePageTitle };

          // WHEN
          routerEventsSubject.next(navigationEnd);

          // THEN
          expect(titleService.setTitle).toHaveBeenCalledWith(parentRoutePageTitle);
        });

        it('should set page title to child route pageTitle if child routes exist and pageTitle is set for child route', () => {
          // GIVEN
          routerState.snapshot.root.data = { pageTitle: parentRoutePageTitle };
          routerState.snapshot.root.firstChild = { data: { pageTitle: childRoutePageTitle } };

          // WHEN
          routerEventsSubject.next(navigationEnd);

          // THEN
          expect(titleService.setTitle).toHaveBeenCalledWith(childRoutePageTitle);
        });

        it('should set page title to parent route pageTitle if child routes exists but pageTitle is not set for child route data', () => {
          // GIVEN
          routerState.snapshot.root.data = { pageTitle: parentRoutePageTitle };
          routerState.snapshot.root.firstChild = { data: {} };

          // WHEN
          routerEventsSubject.next(navigationEnd);

          // THEN
          expect(titleService.setTitle).toHaveBeenCalledWith(parentRoutePageTitle);
        });

        it('should set page title to parent route pageTitle if child routes exists but data is not set for child route', () => {
          // GIVEN
          routerState.snapshot.root.data = { pageTitle: parentRoutePageTitle };
          routerState.snapshot.root.firstChild = {};

          // WHEN
          routerEventsSubject.next(navigationEnd);

          // THEN
          expect(titleService.setTitle).toHaveBeenCalledWith(parentRoutePageTitle);
        });
      });
    });
  });
});
