import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive, Router, NavigationEnd } from '@angular/router';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],  
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.css'
})
export class Sidebar implements OnInit {
  role = '';

  constructor(
    private readonly router: Router,
    private readonly cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadRole();
    this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        this.loadRole();
        this.cdr.detectChanges();
      }
    });
  }

  loadRole(): void {
    this.role = localStorage.getItem('role') || '';
    console.log(this.role);
  }

  isAdmin(): boolean {
    return this.role === 'ADMIN';
  }

  isDoctor(): boolean {
    return this.role === 'DOCTOR';
  }

  isNurse(): boolean {
    return this.role === 'NURSE';
  }

  isReceptionist(): boolean {
    return this.role === 'RECEPTIONIST';
  }

  logout(): void {
    localStorage.clear();
    this.role = '';
    this.cdr.detectChanges();
    this.router.navigate(['/login']);
  }
}