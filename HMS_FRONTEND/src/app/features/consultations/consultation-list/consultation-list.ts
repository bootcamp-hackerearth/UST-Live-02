import { Component, OnInit, OnDestroy, ChangeDetectionStrategy, signal } from '@angular/core';
import { Subject, debounceTime, takeUntil } from 'rxjs';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { EmployeeService } from '../../../core/services/employee';
import { PatientService } from '../../../core/services/patient';
import { ConsultationService } from '../../../core/services/consultation';
import { PaginationComponent } from '../../../shared/components/pagination/pagination';
import { SkeletonLoaderComponent } from '../../../shared/components/skeleton-loader/skeleton-loader';

@Component({
  selector: 'app-consultation-list',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule, PaginationComponent, SkeletonLoaderComponent],
  templateUrl: './consultation-list.html',
  styleUrls: ['./consultation-list.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ConsultationList implements OnInit, OnDestroy {
  readonly consultations = signal<any[]>([]);
  readonly meta = signal<any>({});
  readonly search = signal('');
  readonly doctor = signal('');
  readonly patient = signal('');
  readonly status = signal('');
  readonly startDate = signal('');
  readonly endDate = signal('');
  readonly page = signal(1);
  readonly limit = signal(10);
  readonly cursorStack = signal<string[]>(['']);
  readonly nextCursor = signal('');
  readonly doctors = signal<any[]>([]);
  readonly patients = signal<any[]>([]);
  readonly isLoading = signal(false);

  private readonly destroy$ = new Subject<void>();
  protected readonly searchDebounce$ = new Subject<void>();

  constructor(
    private readonly consultationService: ConsultationService,
    private readonly employeeService: EmployeeService,
    private readonly patientService: PatientService
  ) {}

  // Load consultations on page load
  ngOnInit(): void {
    this.loadDoctors();
    this.loadPatients();
    this.loadConsultations();
    this.searchDebounce$.pipe(debounceTime(300), takeUntil(this.destroy$)).subscribe(() => this.onFilterChange());
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadDoctors(): void {
    this.employeeService.getDoctors().subscribe({
      next: (response) => {
        this.doctors.set(response.data);
      }
    });
  }

  loadPatients(): void {
    this.patientService.getPatients().subscribe({
      next: (response) => {
        this.patients.set(response.data);
      }
    });
  }

  // Fetch all consultations
  loadConsultations(showPageLoader = true): void {
    if (showPageLoader) {
      this.isLoading.set(true);
    }

    const params: any = {
      page: this.page(),
      limit: this.limit(),
      pagination: 'cursor',
      cursor: this.cursorStack()[this.page() - 1] || ''
    };

    if (this.search()) {
      params.search = this.search();
    }

    if (this.doctor()) {
      params.doctor = this.doctor();
    }

    if (this.patient()) {
      params.patient = this.patient();
    }

    if (this.status()) {
      params.status = this.status();
    }

    if (this.startDate()) {
      params.startDate = this.startDate();
    }

    if (this.endDate()) {
      params.endDate = this.endDate();
    }

    this.consultationService.getConsultations(params).subscribe({
      next: (response) => {
        this.consultations.set(response.data);

        this.meta.set(response.meta);
        this.nextCursor.set(response.meta?.nextCursor || '');

        if (this.page() > 1 && this.consultations().length === 0) {
          this.page.set(Math.max(this.meta()?.totalPages || 1, 1));
          this.loadConsultations(false);
          return;
        }

        this.isLoading.set(false);
      },
      error: (error) => {
        console.log(error);

        this.isLoading.set(false);
      }
    });
  }

  onFilterChange(): void {
    this.page.set(1);
    this.cursorStack.set(['']);
    this.nextCursor.set('');

    this.loadConsultations(false);
  }

  previousPage(): void {
    if (this.page() <= 1) {
      return;
    }

    this.page.update(p => p - 1);

    this.loadConsultations(false);
  }

  nextPage(): void {
    if (!this.nextCursor()) {
      return;
    }

    const stack = [...this.cursorStack()];
    stack[this.page()] = this.nextCursor();
    this.cursorStack.set(stack);
    this.page.update(p => p + 1);

    this.loadConsultations(false);
  }

  onPageSizeChange(newLimit: number): void {
    this.limit.set(newLimit);
    this.page.set(1);
    this.cursorStack.set(['']);
    this.nextCursor.set('');
    this.loadConsultations(false);
  }

  // Download prescription PDF
  downloadPdf(consultationId: string): void {
    this.consultationService.downloadPrescriptionPdf(consultationId).subscribe({
      next: (response: Blob) => {
        const fileURL = globalThis.URL.createObjectURL(response);

        globalThis.open(fileURL);
      },
      error: (error) => {
        console.log(error);
      }
    });
  }
}
