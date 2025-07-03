import { AfterViewInit, Component, ElementRef, inject, signal, viewChild } from '@angular/core';
import { FormBuilder, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import SharedModule from 'app/shared/shared.module';

import { PasswordResetInitService } from './password-reset-init.service';

@Component({
  selector: 'jhi-password-reset-init',
  imports: [SharedModule, FormsModule, ReactiveFormsModule],
  templateUrl: './password-reset-init.component.html',
})
export default class PasswordResetInitComponent implements AfterViewInit {
  email = viewChild.required<ElementRef>('email');

  success = signal(false);
  resetRequestForm;

  private readonly passwordResetInitService = inject(PasswordResetInitService);
  private readonly fb = inject(FormBuilder);

  constructor() {
    this.resetRequestForm = this.fb.group({
      email: ['', [Validators.required, Validators.minLength(5), Validators.maxLength(254), Validators.email]],
    });
  }

  ngAfterViewInit(): void {
    this.email().nativeElement.focus();
  }

  requestReset(): void {
    this.passwordResetInitService.save(this.resetRequestForm.get(['email'])!.value).subscribe(() => this.success.set(true));
  }
}
