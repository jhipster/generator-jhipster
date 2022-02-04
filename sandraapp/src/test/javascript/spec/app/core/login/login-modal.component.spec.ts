import { ComponentFixture, TestBed, async, inject, fakeAsync, tick } from '@angular/core/testing';
import { FormBuilder } from '@angular/forms';
import { Router } from '@angular/router';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

import { LoginService } from 'app/core/login/login.service';
import { LoginModalComponent } from 'app/core/login/login-modal.component';
import { TestModule } from '../../../test.module';
import { MockLoginService } from '../../../helpers/mock-login.service';
import { MockRouter } from '../../../helpers/mock-route.service';
import { MockActiveModal } from '../../../helpers/mock-active-modal.service';

describe('Component Tests', () => {
  describe('LoginModalComponent', () => {
    let comp: LoginModalComponent;
    let fixture: ComponentFixture<LoginModalComponent>;
    let mockLoginService: MockLoginService;
    let mockRouter: MockRouter;
    let mockActiveModal: MockActiveModal;

    beforeEach(async(() => {
      TestBed.configureTestingModule({
        imports: [TestModule],
        declarations: [LoginModalComponent],
        providers: [
          FormBuilder,
          {
            provide: LoginService,
            useClass: MockLoginService,
          },
        ],
      })
        .overrideTemplate(LoginModalComponent, '')
        .compileComponents();
    }));

    beforeEach(() => {
      fixture = TestBed.createComponent(LoginModalComponent);
      comp = fixture.componentInstance;
      mockLoginService = TestBed.get(LoginService);
      mockRouter = TestBed.get(Router);
      mockActiveModal = TestBed.get(NgbActiveModal);
    });

    it('should authenticate the user', inject(
      [],
      fakeAsync(() => {
        // GIVEN
        const credentials = {
          username: 'admin',
          password: 'admin',
          rememberMe: true,
        };

        comp.loginForm.patchValue({
          username: 'admin',
          password: 'admin',
          rememberMe: true,
        });
        mockLoginService.setResponse({});
        mockRouter.url = '/admin/metrics';

        // WHEN/
        comp.login();
        tick(); // simulate async

        // THEN
        expect(comp.authenticationError).toEqual(false);
        expect(mockActiveModal.closeSpy).toHaveBeenCalled();
        expect(mockLoginService.loginSpy).toHaveBeenCalledWith(credentials);
      })
    ));

    it('should empty the credentials upon cancel', () => {
      // GIVEN
      comp.loginForm.patchValue({
        username: 'admin',
        password: 'admin',
      });

      const expected = {
        username: '',
        password: '',
        rememberMe: false,
      };

      // WHEN
      comp.cancel();

      // THEN
      expect(comp.authenticationError).toEqual(false);
      expect(comp.loginForm.get('username')!.value).toEqual(expected.username);
      expect(comp.loginForm.get('password')!.value).toEqual(expected.password);
      expect(comp.loginForm.get('rememberMe')!.value).toEqual(expected.rememberMe);
      expect(mockActiveModal.dismissSpy).toHaveBeenCalledWith('cancel');
    });

    it('should redirect user when register', () => {
      // WHEN
      comp.register();

      // THEN
      expect(mockActiveModal.dismissSpy).toHaveBeenCalledWith('to state register');
      expect(mockRouter.navigateSpy).toHaveBeenCalledWith(['/account/register']);
    });

    it('should redirect user when request password', () => {
      // WHEN
      comp.requestResetPassword();

      // THEN
      expect(mockActiveModal.dismissSpy).toHaveBeenCalledWith('to state requestReset');
      expect(mockRouter.navigateSpy).toHaveBeenCalledWith(['/account/reset', 'request']);
    });
  });
});
