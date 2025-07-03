import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, withComponentInputBinding } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { of } from 'rxjs';

import { NotificationDetailComponent } from './notification-detail.component';

describe('Notification Management Detail Component', () => {
  let comp: NotificationDetailComponent;
  let fixture: ComponentFixture<NotificationDetailComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NotificationDetailComponent],
      providers: [
        provideRouter(
          [
            {
              path: '**',
              loadComponent: () => import('./notification-detail.component').then(m => m.NotificationDetailComponent),
              resolve: { notification: () => of({ id: 16124 }) },
            },
          ],
          withComponentInputBinding(),
        ),
      ],
    })
      .overrideTemplate(NotificationDetailComponent, '')
      .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(NotificationDetailComponent);
    comp = fixture.componentInstance;
  });

  describe('OnInit', () => {
    it('should load notification on init', async () => {
      const harness = await RouterTestingHarness.create();
      const instance = await harness.navigateByUrl('/', NotificationDetailComponent);

      // THEN
      expect(instance.notification()).toEqual(expect.objectContaining({ id: 16124 }));
    });
  });

  describe('PreviousState', () => {
    it('should navigate to previous state', () => {
      jest.spyOn(window.history, 'back');
      comp.previousState();
      expect(window.history.back).toHaveBeenCalled();
    });
  });
});
