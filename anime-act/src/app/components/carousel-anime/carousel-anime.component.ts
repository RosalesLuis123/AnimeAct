import { Component, Input, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { AnimeService } from '../../services/anime.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-carousel-anime',
  templateUrl: './carousel-anime.component.html',
  styleUrls: ['./carousel-anime.component.scss']
})
export class CarouselAnimeComponent implements OnInit, OnChanges {
  @Input() category!: string;
  @Input() animesInput?: any[]; // ✅ Nuevo input para calendario
  
  animes: any[] = [];
  loading = true;
  private isCalendarMode = false;

  constructor(private animeService: AnimeService, private router: Router) {}

  ngOnInit() {
    this.loadData();
  }

  ngOnChanges(changes: SimpleChanges) {
    // ✅ Recargar si cambian inputs
    if (changes['animesInput'] || changes['category']) {
      this.loadData();
    }
  }

  // ✅ DETECTAR MODO Y CARGAR DATOS
  private loadData(): void {
    console.log(`🎠 Category: "${this.category}", AnimesInput: ${this.animesInput?.length || 0}`);
    
    // ✅ MODO CALENDARIO: Si recibe animesInput
    if (this.animesInput && this.animesInput.length > 0) {
      this.isCalendarMode = true;
      console.log(`📅 Modo Calendario: usando ${this.animesInput.length} animes`);
      this.processCalendarAnimes();
      return;
    }

    // ✅ MODO HOME: Solo categorías válidas del servicio
    const validCategories = ['airing', 'popular', 'action', 'upcoming'];
    if (validCategories.includes(this.category)) {
      this.isCalendarMode = false;
      console.log(`🌐 Modo Servicio: cargando ${this.category}`);
      this.loadFromService();
    } else {
      // ❌ Categoría inválida (como 'monday') - no cargar populares
      console.warn(`⚠️ Categoría inválida: "${this.category}" - sin datos`);
      this.animes = [];
      this.loading = false;
    }
  }

  // ✅ PROCESAR ANIMES DEL CALENDARIO
  private processCalendarAnimes(): void {
    this.animes = this.animesInput!.map((anime: any) => ({
      mal_id: anime.mal_id || anime.id,
      title: anime.title,
      images: {
        jpg: {
          image_url: anime.images?.jpg?.image_url || 
                    anime.images?.image_url || 
                    anime.image_url || 
                    'https://via.placeholder.com/200x300?text=No+Image'
        }
      },
      score: anime.score,
      ...anime // Mantener otras props
    })).slice(0, 10); // Máximo 10 como antes
    
    this.loading = false;
  }

  // ✅ CARGAR DESDE SERVICIO (solo categorías válidas)
  private loadFromService(): void {
    this.animeService.getAnimesByCategory(this.category).subscribe({
      next: (res: any) => {
        this.animes = (res.data || []).slice(0, 10);
        console.log(`✅ ${this.category}: ${this.animes.length} animes del servicio`);
        this.loading = false;
      },
      error: (err) => {
        console.error(`Error ${this.category}:`, err);
        this.animes = [];
        this.loading = false;
      }
    });
  }

  verDetalles(animeId: number) {
    this.router.navigate(['/anime', animeId]);
  }
}