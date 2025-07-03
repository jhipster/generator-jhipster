import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, withComponentInputBinding } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { of } from 'rxjs';

import { UserDataDetailComponent } from './user-data-detail.component';

describe('UserData Management Detail Component', () => {
  let comp: UserDataDetailComponent;
  let fixture: ComponentFixture<UserDataDetailComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UserDataDetailComponent],
      providers: [
        provideRouter(
          [
            {
              path: '**',
              loadComponent: () => import('./user-data-detail.component').then(m => m.UserDataDetailComponent),
              resolve: { userData: () => of({ id: 15609 }) },
            },
          ],
          withComponentInputBinding(),
        ),
      ],
    })
      .overrideTemplate(UserDataDetailComponent, '')
      .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(UserDataDetailComponent);
    comp = fixture.componentInstance;
  });

  describe('OnInit', () => {
    it('should load userData on init', async () => {
      const harness = await RouterTestingHarness.create();
      const instance = await harness.navigateByUrl('/', UserDataDetailComponent);

      // THEN
      expect(instance.userData()).toEqual(expect.objectContaining({ id: 15609 }));
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
