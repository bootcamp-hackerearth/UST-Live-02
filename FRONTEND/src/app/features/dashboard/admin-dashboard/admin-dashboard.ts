import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth';
import { NodeService } from '../../../core/services/node';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './admin-dashboard.html',
  styleUrl: './admin-dashboard.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AdminDashboard implements OnInit {
  stats: any = {};

  recentEmployees: any[] = [];

  constructor(
    public readonly authService: AuthService,
    public readonly nodeService: NodeService,
    private readonly route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    const dashboard = this.route.snapshot.data['dashboard'];

    this.stats = dashboard?.stats?.data || {};
    this.recentEmployees = dashboard?.recentEmployees?.data || [];
  }
}
