import { Component, OnInit, ChangeDetectorRef, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { ToastService } from '../../../core/services/toast';
import { EmployeeService } from '../../../core/services/employee';
import { NodeService } from '../../../core/services/node';
import { InputDialogService } from '../../../core/services/input-dialog';

@Component({
  selector: 'app-pending-employees',
  imports: [CommonModule],
  templateUrl: './pending-employees.html',
  styleUrl: './pending-employees.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PendingEmployees implements OnInit {
  pendingEmployees: any[] = [];
  generatedPassword = '';

  constructor(
    private readonly employeeService: EmployeeService,
    private readonly route: ActivatedRoute,
    private readonly toastService: ToastService,
    public readonly nodeService: NodeService,
    private readonly cdr: ChangeDetectorRef,
    private readonly inputDialog: InputDialogService
  ) {}

  // Load pending employees on page load
  ngOnInit(): void {
    this.pendingEmployees = this.route.snapshot.data['pendingEmployees']?.data || [];
  }

  // Get all pending employees
  loadPendingEmployees(): void {
    this.employeeService.getPendingEmployees().subscribe({
      next: (response: any) => {
        console.log(response);

        this.pendingEmployees = response.data;

        this.cdr.detectChanges();
      },
      error: (error) => {
        console.log(error);
      }
    });
  }

  // Approve employee
  async approveEmployee(employee: any): Promise<void> {
    let consultationFee = null;

    if (employee.designation === 'DOCTOR') {
      const fee = await this.inputDialog.ask({
        title: 'Consultation fee',
        message: `Enter consultation fee for Dr. ${employee.name}`,
        inputLabel: 'Fee',
        inputType: 'number',
        min: 0,
        confirmText: 'Approve'
      });

      if (fee === null || fee.trim() === '' || Number(fee) < 0) {
        this.toastService.error('Valid consultation fee is required');
        return;
      }

      consultationFee = Number(fee);
    }

    this.employeeService
      .approveEmployee(employee._id, {
        consultationFee
      })
      .subscribe({
        next: (response: any) => {
          console.log(response);

          this.toastService.show(
            employee.designation === 'DOCTOR'
              ? `Doctor approved with consultation fee ₹${consultationFee}`
              : 'Employee approved successfully',
            'success'
          );

          this.loadPendingEmployees();
        },
        error: (error) => {
          console.log(error);

          this.toastService.show(error?.error?.message || 'Failed to approve employee', 'error');
        }
      });
  }

  // Reject employee
  async rejectEmployee(employee: any): Promise<void> {
    const rejectionReason = await this.inputDialog.ask({
      title: 'Reject employee?',
      message: `Add a reason for rejecting ${employee.name}.`,
      inputLabel: 'Reason',
      inputType: 'text',
      confirmText: 'Reject'
    });

    if (rejectionReason === null) {
      return;
    }

    this.employeeService
      .rejectEmployee(employee._id, {
        rejectionReason: rejectionReason.trim() || null
      })
      .subscribe({
        next: (response: any) => {
          console.log(response);

          this.toastService.show('Employee Rejected', 'success');

          this.loadPendingEmployees();
        },
        error: (error) => {
          console.log(error);

          this.toastService.show('Failed to reject employee', 'error');
        }
      });
  }
}
