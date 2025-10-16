import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { AnimeService } from '../../services/anime.service';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {
  userAnimes: any[] = [];
  loadingAnimes = false;

  constructor(public authService: AuthService, private animeService: AnimeService) {}

  ngOnInit() {
    if (this.authService.isLoggedIn()) {
      this.loadUserAnimes();
    }
  }

  loadUserAnimes() {
    this.loadingAnimes = true;
    this.authService.getUserAnimes().subscribe({
      next: (res: any) => {
        this.userAnimes = res;
        console.log('Animes del usuario:', this.userAnimes);
        this.fetchAnimeDetails();
      },
      error: (err) => {
        console.error('❌ Error al cargar animes:', err);
        this.loadingAnimes = false;
      }
    });
  }

  fetchAnimeDetails() {
    if (!this.userAnimes.length) {
      this.loadingAnimes = false;
      return;
    }
    const requests = this.userAnimes.map(anime =>
      this.animeService.getAnimeDetails(anime.anime_id)
    );
    forkJoin(requests).subscribe({
      next: (responses: any[]) => {
        this.userAnimes = this.userAnimes.map((anime, index) => {
          const details = responses[index].data;
          console.log(`Detalles del anime ${anime.anime_id}:`, details);
          return {
            ...anime,
            title: details?.title || 'Desconocido',
            image_url: details?.images?.jpg?.image_url || 'https://via.placeholder.com/150'
          };
        });
        console.log('Animes actualizados:', this.userAnimes);
        this.loadingAnimes = false;
      },
      error: (err) => {
        console.error('❌ Error al cargar detalles:', err);
        this.userAnimes = this.userAnimes.map(anime => ({
          ...anime,
          title: 'Desconocido',
          image_url: 'https://via.placeholder.com/150'
        }));
        this.loadingAnimes = false;
      }
    });
  }

  filterByStatus(status: string) {
    return this.userAnimes.filter(a => a.status.includes(status));
  }
}