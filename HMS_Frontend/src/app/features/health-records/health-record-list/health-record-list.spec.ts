import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HealthRecordList } from './health-record-list';

describe('HealthRecordList', () => {
  let component: HealthRecordList;
  let fixture: ComponentFixture<HealthRecordList>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HealthRecordList]
    }).compileComponents();

    fixture = TestBed.createComponent(HealthRecordList);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
