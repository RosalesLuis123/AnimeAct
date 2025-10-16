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
  userStatuses: string[] = []; // ← Estados actuales del usuario

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
        this.loading = false;
        if (this.authService.isLoggedIn()) {
          this.loadUserStatuses();
        }
      },
      error: (err) => {
        console.error('Error cargando anime:', err);
        this.loading = false;
      }
    });
  }

  loadUserStatuses() {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    this.authService.getUserAnimes().subscribe({
      next: (res: any) => {
        this.userStatuses = res
          .filter((a: any) => a.anime_id === this.anime.mal_id)
          .map((a: any) => a.status);
      },
      error: (err) => console.error('Error obteniendo estados:', err)
    });
  }

  toggleStatus(status: string) {
    if (!this.authService.isLoggedIn()) {
      alert('⚠️ Debes iniciar sesión para guardar tu progreso.');
      this.router.navigate(['/login']);
      return;
    }

    const alreadyHas = this.userStatuses.includes(status);

    if (alreadyHas) {
      this.authService.deleteAnimeStatus(this.anime.mal_id, status).subscribe({
        next: () => {
          this.userStatuses = this.userStatuses.filter(s => s !== status);
        },
        error: (err) => console.error('❌ Error al eliminar estado:', err)
      });
    } else {
      this.authService.saveAnimeStatus(this.anime.mal_id, status).subscribe({
        next: () => this.userStatuses.push(status),
        error: (err) => console.error('❌ Error al guardar estado:', err)
      });
    }
  }

  isActive(status: string): boolean {
    return this.userStatuses.includes(status);
  }
}
