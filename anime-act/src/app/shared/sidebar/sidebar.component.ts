import { Component, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { SidebarService } from '../../services/sidebar.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss']
})
export class SidebarComponent implements OnDestroy {
  visible = false;
  showCategories = false;
  sub: Subscription;

categories = [
  'Accion', 'Aventura', 'Comedia', 'Drama',
  'Fantasia', 'Terror', 'Romance', 'Ciencia Ficcion', 'Deportes'
];

  constructor(
    private router: Router,
    private sidebarService: SidebarService
  ) {
    this.sub = this.sidebarService.visible$.subscribe(v => this.visible = v);
  }

  toggleCategories() { this.showCategories = !this.showCategories; }

  navigateCategory(cat: string) {
    this.router.navigate(['/category', cat.toLowerCase()]);
    this.sidebarService.close();
  }

  closeSidebar() { this.sidebarService.close(); }

  ngOnDestroy() { this.sub.unsubscribe(); }
}
