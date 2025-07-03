import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, withComponentInputBinding } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { of } from 'rxjs';

import { TagDetailComponent } from './tag-detail.component';

describe('Tag Management Detail Component', () => {
  let comp: TagDetailComponent;
  let fixture: ComponentFixture<TagDetailComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TagDetailComponent],
      providers: [
        provideRouter(
          [
            {
              path: '**',
              loadComponent: () => import('./tag-detail.component').then(m => m.TagDetailComponent),
              resolve: { tag: () => of({ id: 19931 }) },
            },
          ],
          withComponentInputBinding(),
        ),
      ],
    })
      .overrideTemplate(TagDetailComponent, '')
      .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TagDetailComponent);
    comp = fixture.componentInstance;
  });

  describe('OnInit', () => {
    it('should load tag on init', async () => {
      const harness = await RouterTestingHarness.create();
      const instance = await harness.navigateByUrl('/', TagDetailComponent);

      // THEN
      expect(instance.tag()).toEqual(expect.objectContaining({ id: 19931 }));
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
