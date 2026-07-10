import { Component, HostListener, ChangeDetectionStrategy } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-home',
  imports: [],
  templateUrl: './home.html',
  styleUrl: './home.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class Home {
  constructor(private router: Router) {}

  goToLogin(): void {
    this.router.navigate(['/login']);
  }

  @HostListener('window:keydown.space')
  handleSpacebar(): void {
    this.goToLogin();
  }
}
