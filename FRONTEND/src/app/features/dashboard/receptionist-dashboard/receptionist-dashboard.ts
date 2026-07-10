import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth';
import { NodeService } from '../../../core/services/node';

@Component({
  selector: 'app-receptionist-dashboard',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './receptionist-dashboard.html',
  styleUrl: './receptionist-dashboard.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ReceptionistDashboard implements OnInit {
  stats: any = {};

  todayAppointments: any[] = [];

  constructor(
    public readonly authService: AuthService,
    public readonly nodeService: NodeService,
    private readonly route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    const dashboard = this.route.snapshot.data['dashboard'];

    this.stats = dashboard?.stats?.data || {};
    this.todayAppointments = dashboard?.todayAppointments?.data || [];
  }
}
