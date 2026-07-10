import { Component, OnInit, ChangeDetectionStrategy, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { EmployeeService } from '../../../core/services/employee';

@Component({
  selector: 'app-employee-details',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './employee-details.html',
  styleUrl: './employee-details.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class EmployeeDetails implements OnInit {
  readonly employee = signal<any>(null);

  constructor(
    private readonly route: ActivatedRoute,
    private readonly employeeService: EmployeeService
  ) {}

  // Load employee details
  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');

    if (!id) {
      return;
    }

    this.employeeService.getEmployeeById(id).subscribe({
      next: (response: any) => {
        console.log(response);

        this.employee.set(response.data);
      },
      error: (error) => {
        console.log(error);
      }
    });
  }
}
