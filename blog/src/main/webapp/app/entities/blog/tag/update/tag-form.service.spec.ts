import { TestBed } from '@angular/core/testing';

import { sampleWithNewData, sampleWithRequiredData } from '../tag.test-samples';

import { TagFormService } from './tag-form.service';

describe('Tag Form Service', () => {
  let service: TagFormService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TagFormService);
  });

  describe('Service methods', () => {
    describe('createTagFormGroup', () => {
      it('should create a new form with FormControl', () => {
        const formGroup = service.createTagFormGroup();

        expect(formGroup.controls).toEqual(
          expect.objectContaining({
            id: expect.any(Object),
            name: expect.any(Object),
            posts: expect.any(Object),
          }),
        );
      });

      it('passing ITag should create a new form with FormGroup', () => {
        const formGroup = service.createTagFormGroup(sampleWithRequiredData);

        expect(formGroup.controls).toEqual(
          expect.objectContaining({
            id: expect.any(Object),
            name: expect.any(Object),
            posts: expect.any(Object),
          }),
        );
      });
    });

    describe('getTag', () => {
      it('should return NewTag for default Tag initial value', () => {
        const formGroup = service.createTagFormGroup(sampleWithNewData);

        const tag = service.getTag(formGroup) as any;

        expect(tag).toMatchObject(sampleWithNewData);
      });

      it('should return NewTag for empty Tag initial value', () => {
        const formGroup = service.createTagFormGroup();

        const tag = service.getTag(formGroup) as any;

        expect(tag).toMatchObject({});
      });

      it('should return ITag', () => {
        const formGroup = service.createTagFormGroup(sampleWithRequiredData);

        const tag = service.getTag(formGroup) as any;

        expect(tag).toMatchObject(sampleWithRequiredData);
      });
    });

    describe('resetForm', () => {
      it('passing ITag should not enable id FormControl', () => {
        const formGroup = service.createTagFormGroup();
        expect(formGroup.controls.id.disabled).toBe(true);

        service.resetForm(formGroup, sampleWithRequiredData);

        expect(formGroup.controls.id.disabled).toBe(true);
      });

      it('passing NewTag should disable id FormControl', () => {
        const formGroup = service.createTagFormGroup(sampleWithRequiredData);
        expect(formGroup.controls.id.disabled).toBe(true);

        service.resetForm(formGroup, { id: null });

        expect(formGroup.controls.id.disabled).toBe(true);
      });
    });
  });
});
