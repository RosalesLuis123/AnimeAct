import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AnimeService } from '../../services/anime.service';

@Component({
  selector: 'app-category',
  templateUrl: './category.component.html',
  styleUrls: ['./category.component.scss']
})
export class CategoryComponent implements OnInit {
  genreName = '';
  animes: any[] = [];
  loading = true;

  // 🔥 Mapeo correcto de nombres → IDs reales según la API Jikan
  genreMap: { [key: string]: number } = {
    'accion': 1,
    'acción': 1,
    'aventura': 2,
    'comedia': 4,
    'drama': 8,
    'fantasía': 10,
    'fantasia': 10,
    'terror': 14,
    'romance': 22,
    'deportes': 30,
    'ciencia ficción': 24,
    'ciencia ficcion': 24
  };

  constructor(
    private route: ActivatedRoute,
    private animeService: AnimeService
  ) {}

  ngOnInit() {
    this.route.paramMap.subscribe(params => {
      const genre = params.get('genre');
      if (genre) {
        this.genreName = genre.charAt(0).toUpperCase() + genre.slice(1);
        this.loadGenre(genre.toLowerCase());
      }
    });
  }

  loadGenre(genreKey: string) {
    const genreId = this.genreMap[genreKey];
    if (!genreId) {
      this.animes = [];
      this.loading = false;
      return;
    }

    this.loading = true;
    this.animeService.getAnimesByGenre(genreId).subscribe({
      next: (res: any) => {
        this.animes = res.data?.slice(0, 20) || [];
        this.loading = false;
      },
      error: (err) => {
        console.error('Error cargando animes:', err);
        this.loading = false;
      }
    });
  }
}
