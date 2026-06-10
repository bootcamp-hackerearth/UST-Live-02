import { Component, OnInit, ChangeDetectorRef } from '@angular/core';

import { CommonModule } from '@angular/common';
import { RouterLink, Router, NavigationEnd } from '@angular/router';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.css'
})
export class Sidebar implements OnInit {
  role = '';

  constructor(
    private readonly router: Router,
    private readonly cdr: ChangeDetectorRef
  ) {}

  // Load role and listen for route changes
  ngOnInit(): void {
    this.loadRole();

    this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        this.loadRole();
        this.cdr.detectChanges();
      }
    });
  }

  // Get role from local storage
  loadRole(): void {
    this.role = localStorage.getItem('role') || '';

    console.log(this.role);
  }

  // Check if current user is admin
  isAdmin(): boolean {
    return this.role === 'ADMIN';
  }

  // Check if current user is doctor
  isDoctor(): boolean {
    return this.role === 'DOCTOR';
  }

  // Check if current user is nurse
  isNurse(): boolean {
    return this.role === 'NURSE';
  }

  // Check if current user is receptionist
  isReceptionist(): boolean {
    return this.role === 'RECEPTIONIST';
  }

  // Logout user
  logout(): void {
    localStorage.clear();

    this.role = '';

    this.cdr.detectChanges();

    this.router.navigate(['/login']);
  }
}