import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpResponse, provideHttpClient } from '@angular/common/http';
import { FormBuilder } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { Subject, from, of } from 'rxjs';

import { BlogService } from '../service/blog.service';
import { IBlog } from '../blog.model';
import { BlogFormService } from './blog-form.service';

import { BlogUpdateComponent } from './blog-update.component';

describe('Blog Management Update Component', () => {
  let comp: BlogUpdateComponent;
  let fixture: ComponentFixture<BlogUpdateComponent>;
  let activatedRoute: ActivatedRoute;
  let blogFormService: BlogFormService;
  let blogService: BlogService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [BlogUpdateComponent],
      providers: [
        provideHttpClient(),
        FormBuilder,
        {
          provide: ActivatedRoute,
          useValue: {
            params: from([{}]),
          },
        },
      ],
    })
      .overrideTemplate(BlogUpdateComponent, '')
      .compileComponents();

    fixture = TestBed.createComponent(BlogUpdateComponent);
    activatedRoute = TestBed.inject(ActivatedRoute);
    blogFormService = TestBed.inject(BlogFormService);
    blogService = TestBed.inject(BlogService);

    comp = fixture.componentInstance;
  });

  describe('ngOnInit', () => {
    it('should update editForm', () => {
      const blog: IBlog = { id: 18619 };

      activatedRoute.data = of({ blog });
      comp.ngOnInit();

      expect(comp.blog).toEqual(blog);
    });
  });

  describe('save', () => {
    it('should call update service on save for existing entity', () => {
      // GIVEN
      const saveSubject = new Subject<HttpResponse<IBlog>>();
      const blog = { id: 26836 };
      jest.spyOn(blogFormService, 'getBlog').mockReturnValue(blog);
      jest.spyOn(blogService, 'update').mockReturnValue(saveSubject);
      jest.spyOn(comp, 'previousState');
      activatedRoute.data = of({ blog });
      comp.ngOnInit();

      // WHEN
      comp.save();
      expect(comp.isSaving).toEqual(true);
      saveSubject.next(new HttpResponse({ body: blog }));
      saveSubject.complete();

      // THEN
      expect(blogFormService.getBlog).toHaveBeenCalled();
      expect(comp.previousState).toHaveBeenCalled();
      expect(blogService.update).toHaveBeenCalledWith(expect.objectContaining(blog));
      expect(comp.isSaving).toEqual(false);
    });

    it('should call create service on save for new entity', () => {
      // GIVEN
      const saveSubject = new Subject<HttpResponse<IBlog>>();
      const blog = { id: 26836 };
      jest.spyOn(blogFormService, 'getBlog').mockReturnValue({ id: null });
      jest.spyOn(blogService, 'create').mockReturnValue(saveSubject);
      jest.spyOn(comp, 'previousState');
      activatedRoute.data = of({ blog: null });
      comp.ngOnInit();

      // WHEN
      comp.save();
      expect(comp.isSaving).toEqual(true);
      saveSubject.next(new HttpResponse({ body: blog }));
      saveSubject.complete();

      // THEN
      expect(blogFormService.getBlog).toHaveBeenCalled();
      expect(blogService.create).toHaveBeenCalled();
      expect(comp.isSaving).toEqual(false);
      expect(comp.previousState).toHaveBeenCalled();
    });

    it('should set isSaving to false on error', () => {
      // GIVEN
      const saveSubject = new Subject<HttpResponse<IBlog>>();
      const blog = { id: 26836 };
      jest.spyOn(blogService, 'update').mockReturnValue(saveSubject);
      jest.spyOn(comp, 'previousState');
      activatedRoute.data = of({ blog });
      comp.ngOnInit();

      // WHEN
      comp.save();
      expect(comp.isSaving).toEqual(true);
      saveSubject.error('This is an error!');

      // THEN
      expect(blogService.update).toHaveBeenCalled();
      expect(comp.isSaving).toEqual(false);
      expect(comp.previousState).not.toHaveBeenCalled();
    });
  });
});
