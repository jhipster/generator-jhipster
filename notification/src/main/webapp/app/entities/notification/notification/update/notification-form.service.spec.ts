import { TestBed } from '@angular/core/testing';

import { sampleWithNewData, sampleWithRequiredData } from '../notification.test-samples';

import { NotificationFormService } from './notification-form.service';

describe('Notification Form Service', () => {
  let service: NotificationFormService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(NotificationFormService);
  });

  describe('Service methods', () => {
    describe('createNotificationFormGroup', () => {
      it('should create a new form with FormControl', () => {
        const formGroup = service.createNotificationFormGroup();

        expect(formGroup.controls).toEqual(
          expect.objectContaining({
            id: expect.any(Object),
            title: expect.any(Object),
          }),
        );
      });

      it('passing INotification should create a new form with FormGroup', () => {
        const formGroup = service.createNotificationFormGroup(sampleWithRequiredData);

        expect(formGroup.controls).toEqual(
          expect.objectContaining({
            id: expect.any(Object),
            title: expect.any(Object),
          }),
        );
      });
    });

    describe('getNotification', () => {
      it('should return NewNotification for default Notification initial value', () => {
        const formGroup = service.createNotificationFormGroup(sampleWithNewData);

        const notification = service.getNotification(formGroup) as any;

        expect(notification).toMatchObject(sampleWithNewData);
      });

      it('should return NewNotification for empty Notification initial value', () => {
        const formGroup = service.createNotificationFormGroup();

        const notification = service.getNotification(formGroup) as any;

        expect(notification).toMatchObject({});
      });

      it('should return INotification', () => {
        const formGroup = service.createNotificationFormGroup(sampleWithRequiredData);

        const notification = service.getNotification(formGroup) as any;

        expect(notification).toMatchObject(sampleWithRequiredData);
      });
    });

    describe('resetForm', () => {
      it('passing INotification should not enable id FormControl', () => {
        const formGroup = service.createNotificationFormGroup();
        expect(formGroup.controls.id.disabled).toBe(true);

        service.resetForm(formGroup, sampleWithRequiredData);

        expect(formGroup.controls.id.disabled).toBe(true);
      });

      it('passing NewNotification should disable id FormControl', () => {
        const formGroup = service.createNotificationFormGroup(sampleWithRequiredData);
        expect(formGroup.controls.id.disabled).toBe(true);

        service.resetForm(formGroup, { id: null });

        expect(formGroup.controls.id.disabled).toBe(true);
      });
    });
  });
});
