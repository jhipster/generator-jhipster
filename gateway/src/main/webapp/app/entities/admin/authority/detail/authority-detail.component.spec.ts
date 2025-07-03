import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, withComponentInputBinding } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { of } from 'rxjs';

import { AuthorityDetailComponent } from './authority-detail.component';

describe('Authority Management Detail Component', () => {
  let comp: AuthorityDetailComponent;
  let fixture: ComponentFixture<AuthorityDetailComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AuthorityDetailComponent],
      providers: [
        provideRouter(
          [
            {
              path: '**',
              loadComponent: () => import('./authority-detail.component').then(m => m.AuthorityDetailComponent),
              resolve: { authority: () => of({ name: '572a7ecc-bf76-43f4-8026-46b42fba586d' }) },
            },
          ],
          withComponentInputBinding(),
        ),
      ],
    })
      .overrideTemplate(AuthorityDetailComponent, '')
      .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AuthorityDetailComponent);
    comp = fixture.componentInstance;
  });

  describe('OnInit', () => {
    it('should load authority on init', async () => {
      const harness = await RouterTestingHarness.create();
      const instance = await harness.navigateByUrl('/', AuthorityDetailComponent);

      // THEN
      expect(instance.authority()).toEqual(expect.objectContaining({ name: '572a7ecc-bf76-43f4-8026-46b42fba586d' }));
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
