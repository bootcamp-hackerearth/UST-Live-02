import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { Auth } from '../../services/auth';
import { CommonModule,Location } from '@angular/common';

@Component({
  selector: 'app-profile',
  imports: [CommonModule],
  templateUrl: './profile.html',
  styleUrl: './profile.css'
})
export class Profile implements OnInit {

  profile: any = null;
  errorMessage = '';

  constructor(readonly authService: Auth,
    readonly cd: ChangeDetectorRef,
    readonly location:Location
  ) { }

  ngOnInit(): void {
    this.getProfile();
  }

  goBack(): void {
  this.location.back();
}

  getProfile() {
    this.authService.getProfile().subscribe({
      next: (res) => {
        this.profile = res.data;
        this.cd.detectChanges();
      },
      error: (err) => {
        this.errorMessage = err.error?.message || 'Failed to load profile';
      }
    });


  }

}