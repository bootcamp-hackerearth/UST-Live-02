import { Component, OnInit, ChangeDetectorRef, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';

import { EmployeeService } from '../../../core/services/employee';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
selector: 'app-employee-details',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './employee-details.html',
  styleUrl: './employee-details.css'
})
export class EmployeeDetails implements OnInit {
  employee: any = null;

  constructor(
    private readonly route: ActivatedRoute,
    private readonly employeeService: EmployeeService,
    private readonly cdr: ChangeDetectorRef
  ) {}

  // Load employee details
  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');

    if (!id) {
      return;
    }

    this.employeeService.getEmployeeById(id).subscribe({
      next: (response: any) => {

        this.employee = response.data;

        this.cdr.markForCheck();
      },

      error: (error) => {
      }
    });
  }
}
