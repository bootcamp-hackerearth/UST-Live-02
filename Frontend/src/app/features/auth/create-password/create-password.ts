import { Component, ChangeDetectorRef, ChangeDetectionStrategy } from '@angular/core';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

import { TokenService } from '../../../core/services/token';
import { AuthService } from '../../../core/services/auth';
import { MenuNodeService } from '../../../core/services/menu-node';
import { ToastService } from '../../../core/services/toast';
import { getApiErrorMessage } from '../../../core/utils/api-error';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
selector: 'app-create-password',
  imports: [ReactiveFormsModule],
  templateUrl: './create-password.html',
  styleUrl: './create-password.css'
})
export class CreatePassword {
  passwordForm: FormGroup;
  temporaryPasswordServerError = '';
  errorMessage = '';

  securityQuestions = [
    'What is your favourite color?',
    'What is your pet name?',
    'What is your birth city?',
    'What is your favourite food?',
    'What is your school name?'
  ];

  constructor(
    private readonly fb: FormBuilder,
    private readonly router: Router,
    private readonly tokenService: TokenService,
    private readonly authService: AuthService,
    private readonly menuNodeService: MenuNodeService,
    private readonly toastService: ToastService,
    private readonly cdr: ChangeDetectorRef
  ) {
    this.passwordForm = this.fb.group({
      temporaryPassword: ['', Validators.required],

      newPassword: [
        '',
        [
          Validators.required,
          Validators.minLength(8),
          Validators.maxLength(20),
          Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])/)
        ]
      ],

      confirmPassword: ['', Validators.required],
      securityQuestion: ['', Validators.required],
      securityAnswer: ['', Validators.required]
    });

    this.passwordForm.get('temporaryPassword')?.valueChanges.subscribe(() => {
      this.temporaryPasswordServerError = '';
      this.errorMessage = '';
      this.cdr.markForCheck();
    });
  }

  // Create password on first login
  onSubmit(): void {
    this.temporaryPasswordServerError = '';
    this.errorMessage = '';

    if (this.passwordForm.invalid) {
      this.passwordForm.markAllAsTouched();
      this.cdr.markForCheck();
      return;
    }

    if (this.passwordForm.value.newPassword !== this.passwordForm.value.confirmPassword) {
      this.errorMessage = 'Passwords do not match';
      this.cdr.markForCheck();
      return;
    }

    const payload = {
      loginId: localStorage.getItem('loginId'),
      temporaryPassword: this.passwordForm.value.temporaryPassword,
      newPassword: this.passwordForm.value.newPassword,
      confirmPassword: this.passwordForm.value.confirmPassword,
      securityQuestion: this.passwordForm.value.securityQuestion,
      securityAnswer: this.passwordForm.value.securityAnswer
    };

    this.authService.createPassword(payload).subscribe({
      next: (response) => {

        this.tokenService.removeTokens();
        this.menuNodeService.clearMenu();
        this.router.navigate(['/login']);
      },

      error: (error) => {
        const errorMessage = getApiErrorMessage(error, 'Failed to create password');

        if (errorMessage.toLowerCase().includes('temporary password')) {
          this.temporaryPasswordServerError = errorMessage;
          this.passwordForm.get('temporaryPassword')?.markAsTouched();
          this.cdr.markForCheck();
          return;
        }

        this.errorMessage = errorMessage;
        this.cdr.markForCheck();
      }
    });
  }
}
