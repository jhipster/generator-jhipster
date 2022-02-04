import { ComponentFixture, TestBed, async } from '@angular/core/testing';
import { HttpResponse } from '@angular/common/http';
import { FormBuilder } from '@angular/forms';
import { of, throwError } from 'rxjs';

import { TestModule } from '../../../test.module';
import { PasswordComponent } from 'app/account/password/password.component';
import { PasswordService } from 'app/account/password/password.service';

describe('Component Tests', () => {
  describe('PasswordComponent', () => {
    let comp: PasswordComponent;
    let fixture: ComponentFixture<PasswordComponent>;
    let service: PasswordService;

    beforeEach(async(() => {
      TestBed.configureTestingModule({
        imports: [TestModule],
        declarations: [PasswordComponent],
        providers: [FormBuilder],
      })
        .overrideTemplate(PasswordComponent, '')
        .compileComponents();
    }));

    beforeEach(() => {
      fixture = TestBed.createComponent(PasswordComponent);
      comp = fixture.componentInstance;
      service = fixture.debugElement.injector.get(PasswordService);
    });

    it('should show error if passwords do not match', () => {
      // GIVEN
      comp.passwordForm.patchValue({
        newPassword: 'password1',
        confirmPassword: 'password2',
      });
      // WHEN
      comp.changePassword();
      // THEN
      expect(comp.doNotMatch).toBe(true);
      expect(comp.error).toBe(false);
      expect(comp.success).toBe(false);
    });

    it('should call Auth.changePassword when passwords match', () => {
      // GIVEN
      const passwordValues = {
        currentPassword: 'oldPassword',
        newPassword: 'myPassword',
      };

      spyOn(service, 'save').and.returnValue(of(new HttpResponse({ body: true })));

      comp.passwordForm.patchValue({
        currentPassword: passwordValues.currentPassword,
        newPassword: passwordValues.newPassword,
        confirmPassword: passwordValues.newPassword,
      });

      // WHEN
      comp.changePassword();

      // THEN
      expect(service.save).toHaveBeenCalledWith(passwordValues.newPassword, passwordValues.currentPassword);
    });

    it('should set success to true upon success', () => {
      // GIVEN
      spyOn(service, 'save').and.returnValue(of(new HttpResponse({ body: true })));
      comp.passwordForm.patchValue({
        newPassword: 'myPassword',
        confirmPassword: 'myPassword',
      });

      // WHEN
      comp.changePassword();

      // THEN
      expect(comp.doNotMatch).toBe(false);
      expect(comp.error).toBe(false);
      expect(comp.success).toBe(true);
    });

    it('should notify of error if change password fails', () => {
      // GIVEN
      spyOn(service, 'save').and.returnValue(throwError('ERROR'));
      comp.passwordForm.patchValue({
        newPassword: 'myPassword',
        confirmPassword: 'myPassword',
      });

      // WHEN
      comp.changePassword();

      // THEN
      expect(comp.doNotMatch).toBe(false);
      expect(comp.success).toBe(false);
      expect(comp.error).toBe(true);
    });
  });
});
