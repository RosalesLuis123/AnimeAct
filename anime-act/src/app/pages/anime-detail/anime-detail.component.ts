import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AnimeService } from '../../services/anime.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-anime-detail',
  templateUrl: './anime-detail.component.html',
  styleUrls: ['./anime-detail.component.scss']
})
export class AnimeDetailComponent implements OnInit {
  anime: any;
  loading = true;

  constructor(
    private route: ActivatedRoute,
    private animeService: AnimeService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit() {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.animeService.getAnimeDetails(id).subscribe({
      next: (res: any) => {
        this.anime = res.data;
        console.log('Anime data:', this.anime);
        this.loading = false;
      },
      error: (err) => {
        console.error('Error cargando anime:', err);
        this.loading = false;
      }
    });
  }

  updateStatus(status: string) {
    if (!this.authService.isLoggedIn()) {
      alert('⚠️ Debes iniciar sesión para guardar tu progreso.');
      this.router.navigate(['/login']);
      return;
    }
    if (!this.anime?.mal_id || !status) {
      alert('⚠️ Error: Anime o estado no definido.');
      console.error('Datos inválidos:', { animeId: this.anime?.mal_id, status });
      return;
    }
    console.log('Enviando:', { animeId: this.anime.mal_id, status });
    this.authService.saveAnimeStatus(this.anime.mal_id, status).subscribe({
      next: () => alert(`✅ Anime marcado como "${status}"`),
      error: (err) => {
        console.error('Error al guardar estado:', err);
        if (err.status === 403) {
          alert('⚠️ Sesión expirada. Por favor, inicia sesión nuevamente.');
          this.authService.logout();
          this.router.navigate(['/login']);
        } else {
          alert(`❌ No se pudo guardar el estado. Código: ${err.status}, Mensaje: ${err.error?.error || err.message}`);
        }
      }
    });
  }
}