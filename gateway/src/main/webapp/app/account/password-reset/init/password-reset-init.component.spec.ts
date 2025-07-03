import { ElementRef, signal } from '@angular/core';
import { ComponentFixture, TestBed, inject } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { FormBuilder } from '@angular/forms';
import { of, throwError } from 'rxjs';

import PasswordResetInitComponent from './password-reset-init.component';
import { PasswordResetInitService } from './password-reset-init.service';

describe('PasswordResetInitComponent', () => {
  let fixture: ComponentFixture<PasswordResetInitComponent>;
  let comp: PasswordResetInitComponent;

  beforeEach(() => {
    fixture = TestBed.configureTestingModule({
      imports: [PasswordResetInitComponent],
      providers: [provideHttpClient(), FormBuilder],
    })
      .overrideTemplate(PasswordResetInitComponent, '')
      .createComponent(PasswordResetInitComponent);
    comp = fixture.componentInstance;
  });

  it('sets focus after the view has been initialized', () => {
    const node = {
      focus: jest.fn(),
    };
    comp.email = signal<ElementRef>(new ElementRef(node));

    comp.ngAfterViewInit();

    expect(node.focus).toHaveBeenCalled();
  });

  it('notifies of success upon successful requestReset', inject([PasswordResetInitService], (service: PasswordResetInitService) => {
    jest.spyOn(service, 'save').mockReturnValue(of({}));
    comp.resetRequestForm.patchValue({
      email: 'user@domain.com',
    });

    comp.requestReset();

    expect(service.save).toHaveBeenCalledWith('user@domain.com');
    expect(comp.success()).toBe(true);
  }));

  it('no notification of success upon error response', inject([PasswordResetInitService], (service: PasswordResetInitService) => {
    const err = { status: 503, data: 'something else' };
    jest.spyOn(service, 'save').mockReturnValue(throwError(() => err));
    comp.resetRequestForm.patchValue({
      email: 'user@domain.com',
    });
    comp.requestReset();

    expect(service.save).toHaveBeenCalledWith('user@domain.com');
    expect(comp.success()).toBe(false);
  }));
});
