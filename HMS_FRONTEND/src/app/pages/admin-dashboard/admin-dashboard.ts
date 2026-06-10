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
      })
  }

  showEmployees() {
    this.selectedSection='employees';
    this.http.get(`${this.baseUrl}/users/list`)
      .subscribe((res: any) => {
        this.employees = res.data;
        this.cd.detectChanges();
      })
  }

  showPatients() {
  this.selectedSection = 'patients';

  this.http.get(`${this.baseUrl}/patients/list`)
    .subscribe((res: any) => {
      this.patients = res.data;
      this.cd.detectChanges();
    });
}

showPendingRequests() {
  this.selectedSection = 'pending';

  this.http.get(`${this.baseUrl}/join-us/pending`)
    .subscribe({
      next: (res: any) => {
        this.pendingRequests = res.data;
        this.cd.detectChanges();
      },
      error: (err) => {
      }
    });
}


}
