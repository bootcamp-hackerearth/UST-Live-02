import { Component, HostListener, ChangeDetectionStrategy } from '@angular/core';

import { Router } from '@angular/router';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
selector: 'app-home',

  imports: [],

  templateUrl: './home.html',

  styleUrl: './home.css'
})
export class Home {
  constructor(private router: Router) {}

  @HostListener('window:keydown.space')
  handleSpacebar(): void {
    this.router.navigate(['/login']);
  }
}
