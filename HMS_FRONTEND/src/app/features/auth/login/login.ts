import { Component, ChangeDetectionStrategy, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../../core/services/auth';
import { TokenService } from '../../../core/services/token';
import { ToastService } from '../../../core/services/toast';
import { NodeService } from '../../../core/services/node';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './login.html',
  styleUrl: './login.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class Login {
  loginForm: FormGroup;

  readonly isSubmitting = signal(false);
  readonly errorMessage = signal('');

  constructor(
    private readonly fb: FormBuilder,
    private readonly authService: AuthService,
    private readonly tokenService: TokenService,
    private readonly router: Router,
    private readonly toastService: ToastService,
    private readonly nodeService: NodeService
  ) {
    this.loginForm = this.fb.group({
      loginId: ['', Validators.required],
      password: ['', Validators.required]
    });
  }

  onSubmit(): void {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();

      this.toastService.show('Please enter valid credentials', 'error');

      return;
    }

    this.isSubmitting.set(true);

    this.authService.login(this.loginForm.value).subscribe({
      next: (response: any) => {
        console.log('LOGIN RESPONSE', response);

        console.log('USER', response.data.user);

        console.log('ROLES', response.data.user?.roles);

        console.log('ACCESS TOKEN', response.data.accessToken);
        const accessToken = response.data.accessToken;

        const user = response.data.user;

        this.tokenService.setAccessToken(accessToken);

        this.authService.setCurrentUser(user);

        localStorage.setItem('role', user.roles?.[0]);

        localStorage.setItem('loginId', this.loginForm.value.loginId);

        if (user.isFirstLogin) {
          this.isSubmitting.set(false);

          this.toastService.show('Login successful', 'success');

          this.router.navigate(['/create-password']);

          return;
        }

        // Load nodes before navigation
        this.nodeService.getNodes().subscribe({
          next: (nodeResponse: any) => {
            this.nodeService.setNodes(nodeResponse.data || []);

            this.toastService.show('Login successful', 'success');

            this.isSubmitting.set(false);

            const role = user.roles?.[0];

            switch (role) {
              case 'SUPER_ADMIN':
              case 'ADMIN':
                this.router.navigate(['/dashboard/admin']);
                break;

              case 'DOCTOR':
                this.router.navigate(['/dashboard/doctor']);
                break;

              case 'RECEPTIONIST':
                this.router.navigate(['/dashboard/receptionist']);
                break;

              default:
                this.toastService.show('Invalid role', 'error');

                this.router.navigate(['/login']);
            }
          },
          error: () => {
            this.isSubmitting.set(false);

            this.toastService.show('Failed to load menu permissions', 'error');
          }
        });
      },
      error: (error) => {
        this.toastService.show(error?.error?.message || 'Login failed', 'error');

        this.isSubmitting.set(false);
      }
    });
  }
}
