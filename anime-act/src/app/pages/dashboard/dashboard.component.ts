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

  // ⚡ Evita llamadas duplicadas para el mismo anime_id
  const uniqueAnimeIds = [...new Set(this.userAnimes.map(a => a.anime_id))];

  const requests = uniqueAnimeIds.map(id =>
    this.animeService.getAnimeDetails(id)
  );

  forkJoin(requests).subscribe({
    next: (responses: any[]) => {
      const detailsMap = new Map<number, any>();
      uniqueAnimeIds.forEach((id, i) => detailsMap.set(id, responses[i].data));

      this.userAnimes = this.userAnimes.map(anime => {
        const details = detailsMap.get(anime.anime_id);
        return {
          ...anime,
          title: details?.title || 'Desconocido',
          image_url: details?.images?.jpg?.image_url || 'https://via.placeholder.com/150'
        };
      });

      console.log('✅ Animes actualizados:', this.userAnimes);
      this.loadingAnimes = false;
    },
    error: (err) => {
      console.error('❌ Error al cargar detalles:', err);
      this.loadingAnimes = false;
    }
  });
}


 filterByStatus(status: string) {
  return this.userAnimes.filter(a => a.status?.toLowerCase() === status.toLowerCase());
}

removeStatus(anime: any) {
  if (!confirm(`¿Quitar '${anime.status}' de "${anime.title}"?`)) return;

  this.authService.deleteAnimeStatus(anime.anime_id, anime.status).subscribe({
    next: () => {
      this.userAnimes = this.userAnimes.filter(a => !(a.anime_id === anime.anime_id && a.status === anime.status));
    },
    error: (err) => console.error('❌ Error al eliminar estado:', err)
  });
}

}