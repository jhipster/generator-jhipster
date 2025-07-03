import { Component, Injector, OnInit, Signal, inject, signal } from '@angular/core';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { toSignal } from '@angular/core/rxjs-interop';

import SharedModule from 'app/shared/shared.module';
import { AccountService } from 'app/core/auth/account.service';
import { Account } from 'app/core/auth/account.model';
import { PasswordService } from './password.service';
import PasswordStrengthBarComponent from './password-strength-bar/password-strength-bar.component';

@Component({
  selector: 'jhi-password',
  imports: [SharedModule, FormsModule, ReactiveFormsModule, PasswordStrengthBarComponent],
  templateUrl: './password.component.html',
})
export default class PasswordComponent implements OnInit {
  doNotMatch = signal(false);
  error = signal(false);
  success = signal(false);
  account?: Signal<Account | undefined | null>;
  passwordForm = new FormGroup({
    currentPassword: new FormControl('', { nonNullable: true, validators: Validators.required }),
    newPassword: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.minLength(4), Validators.maxLength(50)],
    }),
    confirmPassword: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.minLength(4), Validators.maxLength(50)],
    }),
  });

  private readonly passwordService = inject(PasswordService);
  private readonly accountService = inject(AccountService);
  private readonly injector = inject(Injector);

  ngOnInit(): void {
    const account$ = this.accountService.identity();
    this.account = toSignal(account$, { injector: this.injector });
  }

  changePassword(): void {
    this.error.set(false);
    this.success.set(false);
    this.doNotMatch.set(false);

    const { newPassword, confirmPassword, currentPassword } = this.passwordForm.getRawValue();
    if (newPassword !== confirmPassword) {
      this.doNotMatch.set(true);
    } else {
      this.passwordService.save(newPassword, currentPassword).subscribe({
        next: () => this.success.set(true),
        error: () => this.error.set(true),
      });
    }
  }
}
