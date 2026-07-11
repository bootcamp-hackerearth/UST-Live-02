import { Component, HostListener } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './navbar.html',
  styleUrl: './navbar.css'
})
export class Navbar {

  showProfileDropdown = false;

  constructor(readonly router: Router) {}

  toggleProfileDropdown() {
    this.showProfileDropdown = !this.showProfileDropdown;
  }

  viewProfile() {
    this.showProfileDropdown = false;
    this.router.navigate(['/profile']);
  }

  logout() {
    this.showProfileDropdown = false;

    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('userId');
    localStorage.removeItem('role');
    localStorage.removeItem('email');

   
    localStorage.clear();

   
    sessionStorage.clear();

   
    document.cookie.split(";").forEach((c) => {
      document.cookie = c
        .replace(/^ +/, "")
        .replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
    });


    this.router.navigate(['/login']);

    console.log('User logged out successfully');
  }

 
  @HostListener('document:click', ['$event'])
  onDocumentClick(event: Event) {
    const target = event.target as HTMLElement;
    if (!target.closest('.navbar-profile-wrapper')) {
      this.showProfileDropdown = false;
    }
  }

}