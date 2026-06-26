import { Component, OnInit ,ChangeDetectorRef } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-admin-dashboard',
  imports: [],
  templateUrl: './admin-dashboard.html',
  styleUrl: './admin-dashboard.css',
})
export class AdminDashboard implements OnInit {

  readonly baseUrl=environment.apiUrl;
  readonly dashboardPreviewLimit = 7;

  stats = {
    totalPatients: 0,
    totalEmployees: 0,
    pendingApprovals: 0
  };

  employees: any[] = [];
  patients: any[] = [];
  pendingRequests: any[] = [];

  selectedSection = 'employees';

  constructor(readonly http: HttpClient,
    readonly cd: ChangeDetectorRef
  ) { }

  ngOnInit(): void {

    this.getDashboardStats();
    this.showEmployees();

  }

  getDashboardStats() {

    this.http.get(`${this.baseUrl}/dashboard`)
      .subscribe((res: any) => {
        this.stats = res.data;
        this.cd.detectChanges();
        console.log('dashboard stats', this.stats);
      })
  }

  showEmployees() {
    this.selectedSection='employees';
    this.http.get(`${this.baseUrl}/users/list`)
      .subscribe((res: any) => {
        this.employees = res.data;
        this.cd.detectChanges();
        console.log('dashboard stats', this.employees);
      })
  }
showPatients() {
  this.selectedSection = 'patients';

  this.http.get(`${this.baseUrl}/patients/list`, {
    params: {
      page: 1,
      limit: this.dashboardPreviewLimit,
      search: ''
    }
  }).subscribe((res: any) => {
    this.patients = res.data;
    this.cd.detectChanges();
  });
}

showPendingRequests() {
  this.selectedSection = 'pending';

  this.http.get(`${this.baseUrl}/join-us/pending`)
    .subscribe({
      next: (res: any) => {
        console.log('Pending API response:', res);
        this.pendingRequests = res.data;
        console.log('Pending requests array:', this.pendingRequests);
        this.cd.detectChanges();
      },
      error: (err) => {
        console.log('Pending API error:', err);
      }
    });
}


}
