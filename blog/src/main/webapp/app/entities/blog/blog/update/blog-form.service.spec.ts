import { TestBed } from '@angular/core/testing';

import { sampleWithNewData, sampleWithRequiredData } from '../blog.test-samples';

import { BlogFormService } from './blog-form.service';

describe('Blog Form Service', () => {
  let service: BlogFormService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(BlogFormService);
  });

  describe('Service methods', () => {
    describe('createBlogFormGroup', () => {
      it('should create a new form with FormControl', () => {
        const formGroup = service.createBlogFormGroup();

        expect(formGroup.controls).toEqual(
          expect.objectContaining({
            id: expect.any(Object),
            name: expect.any(Object),
            handle: expect.any(Object),
          }),
        );
      });

      it('passing IBlog should create a new form with FormGroup', () => {
        const formGroup = service.createBlogFormGroup(sampleWithRequiredData);

        expect(formGroup.controls).toEqual(
          expect.objectContaining({
            id: expect.any(Object),
            name: expect.any(Object),
            handle: expect.any(Object),
          }),
        );
      });
    });

    describe('getBlog', () => {
      it('should return NewBlog for default Blog initial value', () => {
        const formGroup = service.createBlogFormGroup(sampleWithNewData);

        const blog = service.getBlog(formGroup) as any;

        expect(blog).toMatchObject(sampleWithNewData);
      });

      it('should return NewBlog for empty Blog initial value', () => {
        const formGroup = service.createBlogFormGroup();

        const blog = service.getBlog(formGroup) as any;

        expect(blog).toMatchObject({});
      });

      it('should return IBlog', () => {
        const formGroup = service.createBlogFormGroup(sampleWithRequiredData);

        const blog = service.getBlog(formGroup) as any;

        expect(blog).toMatchObject(sampleWithRequiredData);
      });
    });

    describe('resetForm', () => {
      it('passing IBlog should not enable id FormControl', () => {
        const formGroup = service.createBlogFormGroup();
        expect(formGroup.controls.id.disabled).toBe(true);

        service.resetForm(formGroup, sampleWithRequiredData);

        expect(formGroup.controls.id.disabled).toBe(true);
      });

      it('passing NewBlog should disable id FormControl', () => {
        const formGroup = service.createBlogFormGroup(sampleWithRequiredData);
        expect(formGroup.controls.id.disabled).toBe(true);

        service.resetForm(formGroup, { id: null });

        expect(formGroup.controls.id.disabled).toBe(true);
      });
    });
  });
});
