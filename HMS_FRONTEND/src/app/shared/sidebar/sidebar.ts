import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-sidebar',
  imports: [RouterLink, CommonModule, RouterLinkActive],
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.css',
})
export class Sidebar implements OnInit {
  nodes: any[] = [];

  constructor(
    readonly http: HttpClient,
    readonly cd: ChangeDetectorRef
  ) {
  } // Constructor closes here

  ngOnInit(): void {
    this.http
      .get<any>('http://localhost:5000/api/node/list')
      .subscribe({
        next: (response) => {
          this.nodes = response.data;
          this.cd.detectChanges();

          console.log('nodes:', this.nodes);
        },
        error: (error) => {
          console.error('Failed to load sidebar nodes:', error);
        },
      });
  }

  getFullPath(path: string): string {
    const basePath = localStorage.getItem('basePath') || '';
    return `${basePath}${path}`;
  }
}