import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PendingEmployees } from './pending-employees';

describe('PendingEmployees', () => {
  let component: PendingEmployees;
  let fixture: ComponentFixture<PendingEmployees>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PendingEmployees]
    }).compileComponents();

    fixture = TestBed.createComponent(PendingEmployees);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
