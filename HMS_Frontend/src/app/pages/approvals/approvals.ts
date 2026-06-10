import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-approvals',
  imports: [],
  templateUrl: './approvals.html',
  styleUrl: './approvals.css',
})
export class Approvals implements OnInit {

  pendingRequests: any[] = [];
  expandedRequestId: string | null = null;
 

  constructor(
    private http: HttpClient,
    private cd: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.getPendingRequests();
  }

  getPendingRequests() {
    this.http.get('http://localhost:5000/api/join-us/pending')
      .subscribe({
        next: (res: any) => {
          this.pendingRequests = res.data;
          console.log('Pending requests:', this.pendingRequests);
          this.cd.detectChanges();
        },
        error: (err) => {
          console.log('Error fetching pending requests:', err);
        }
      });
  }

   toggleDetails(requestId: string) {
  if (this.expandedRequestId === requestId) {
    this.expandedRequestId = null;
  } else {
    this.expandedRequestId = requestId;
  }
}
  approveRequest(requestId: string) {
    this.http.put(`http://localhost:5000/api/join-us/approve/${requestId}`, {})
      .subscribe({
        next: (res: any) => {
          console.log('Approved:', res);

          this.pendingRequests = this.pendingRequests.filter(
            request => request._id !== requestId
          );

          this.cd.detectChanges();
        },
        error: (err) => {
          console.log('Approval error:', err);
        }
      });
  }

  rejectRequest(requestId: string) {
    const rejectionReason = prompt('Enter rejection reason');

    if (!rejectionReason) {
      return;
    }

    this.http.put(`http://localhost:5000/api/join-us/reject/${requestId}`, {
      rejectionReason
    }).subscribe({
      next: (res: any) => {
        console.log('Rejected:', res);

        this.pendingRequests = this.pendingRequests.filter(
          request => request._id !== requestId
        );

        this.cd.detectChanges();
      },
      error: (err) => {
        console.log('Reject error:', err);
      }
    });
  }
}
