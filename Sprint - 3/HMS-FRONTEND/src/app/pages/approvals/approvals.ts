import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApprovalsService } from '../../services/approval.service';
import { ApprovalRequest } from '../../models/approval.model';

@Component({
  selector: 'app-approvals',
  imports: [CommonModule],
  templateUrl: './approvals.html',
  styleUrl: './approvals.css',
})
export class Approvals implements OnInit {

  pendingRequests: ApprovalRequest[] = [];
  expandedRequestId: string | null = null;

  constructor(
    readonly approvalsService: ApprovalsService,
    readonly cd: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.getPendingRequests();
  }

  getPendingRequests() {
    this.approvalsService.getPendingRequests()
      .subscribe({
        next: (res) => {
          this.pendingRequests = res.data;
          this.cd.detectChanges();
        },
        error: (err) => {}
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
    this.approvalsService.approveRequest(requestId)
      .subscribe({
        next: (res) => {
          this.pendingRequests = this.pendingRequests.filter(
            request => request._id !== requestId
          );
          this.cd.detectChanges();
        },
        error: (err) => {}
      });
  }

  rejectRequest(requestId: string) {
    const rejectionReason = prompt('Enter rejection reason');

    if (!rejectionReason) {
      return;
    }

    this.approvalsService.rejectRequest(requestId, rejectionReason)
      .subscribe({
        next: (res) => {
          this.pendingRequests = this.pendingRequests.filter(
            request => request._id !== requestId
          );
          this.cd.detectChanges();
        },
        error: (err) => {}
      });
  }
}