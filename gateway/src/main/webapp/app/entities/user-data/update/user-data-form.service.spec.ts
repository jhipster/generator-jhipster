import { TestBed } from '@angular/core/testing';

import { sampleWithNewData, sampleWithRequiredData } from '../user-data.test-samples';

import { UserDataFormService } from './user-data-form.service';

describe('UserData Form Service', () => {
  let service: UserDataFormService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(UserDataFormService);
  });

  describe('Service methods', () => {
    describe('createUserDataFormGroup', () => {
      it('should create a new form with FormControl', () => {
        const formGroup = service.createUserDataFormGroup();

        expect(formGroup.controls).toEqual(
          expect.objectContaining({
            id: expect.any(Object),
            address: expect.any(Object),
          }),
        );
      });

      it('passing IUserData should create a new form with FormGroup', () => {
        const formGroup = service.createUserDataFormGroup(sampleWithRequiredData);

        expect(formGroup.controls).toEqual(
          expect.objectContaining({
            id: expect.any(Object),
            address: expect.any(Object),
          }),
        );
      });
    });

    describe('getUserData', () => {
      it('should return NewUserData for default UserData initial value', () => {
        const formGroup = service.createUserDataFormGroup(sampleWithNewData);

        const userData = service.getUserData(formGroup) as any;

        expect(userData).toMatchObject(sampleWithNewData);
      });

      it('should return NewUserData for empty UserData initial value', () => {
        const formGroup = service.createUserDataFormGroup();

        const userData = service.getUserData(formGroup) as any;

        expect(userData).toMatchObject({});
      });

      it('should return IUserData', () => {
        const formGroup = service.createUserDataFormGroup(sampleWithRequiredData);

        const userData = service.getUserData(formGroup) as any;

        expect(userData).toMatchObject(sampleWithRequiredData);
      });
    });

    describe('resetForm', () => {
      it('passing IUserData should not enable id FormControl', () => {
        const formGroup = service.createUserDataFormGroup();
        expect(formGroup.controls.id.disabled).toBe(true);

        service.resetForm(formGroup, sampleWithRequiredData);

        expect(formGroup.controls.id.disabled).toBe(true);
      });

      it('passing NewUserData should disable id FormControl', () => {
        const formGroup = service.createUserDataFormGroup(sampleWithRequiredData);
        expect(formGroup.controls.id.disabled).toBe(true);

        service.resetForm(formGroup, { id: null });

        expect(formGroup.controls.id.disabled).toBe(true);
      });
    });
  });
});
