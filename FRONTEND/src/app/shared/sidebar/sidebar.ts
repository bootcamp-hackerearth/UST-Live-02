import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink ,RouterLinkActive} from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
@Component({
  selector: 'app-sidebar',
  imports: [RouterLink, CommonModule,RouterLinkActive],
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.css',

})
export class Sidebar implements OnInit {

  nodes: any[] = []

  constructor(readonly http: HttpClient,
    readonly cd:ChangeDetectorRef
  ) {}

  ngOnInit(): void {


   
    this.http.get(`${environment.apiUrl}/node/list`).subscribe((Response: any) => {
      this.nodes = Response.data;
      this.cd.detectChanges();

      console.log("nodes:", this.nodes);
    });
   
   
   
   
   
  }

   getFullPath(path: string): string {
    const basePath = localStorage.getItem('basePath') || '';
    return `${basePath}${path}`;
  }
}
