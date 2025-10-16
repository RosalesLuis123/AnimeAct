import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';

interface Anime {
  mal_id?: number;
  title: string;
  images?: { jpg?: { image_url?: string } };
  broadcast?: { day?: string };
  score?: number;
}

interface DaySection {
  title: string;
  type: string;
  animes: Anime[];
}

@Component({
  selector: 'app-calendar',
  templateUrl: './calendar.component.html',
  styleUrls: ['./calendar.component.scss']
})
export class CalendarComponent implements OnInit {
  sections: DaySection[] = [];
  loading = true;

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.loadSeasonNow();
  }

  loadSeasonNow(): void {
    // ✅ IGUAL QUE TU CÓDIGO ORIGINAL
    this.http.get<any>('https://api.jikan.moe/v4/seasons/now').subscribe({
      next: (res) => {
        // ✅ NO mapping - usar res.data directamente como tu código
        const animes: Anime[] = res.data || [];
        console.log(`📋 ${animes.length} animes de seasons/now`);
        this.organizeByDay(animes);
        this.loading = false;
      },
      error: (err) => {
        console.error('Error:', err);
        this.loading = false;
      }
    });
  }

  // ✅ LÓGICA EXACTA DE TU CÓDIGO ORIGINAL
  organizeByDay(animes: Anime[]): void {
    const grouped: Record<string, any[]> = {};

    animes.forEach((anime) => {
      // ✅ MISMO QUE EL ORIGINAL
      let day = anime.broadcast?.day || 'Futuros';
      
      // ✅ SOLO normalización simple - quitar 's'
      day = day.replace(/s$/i, '');

      console.log(`📅 ${anime.title} → ${day}`);

      if (!grouped[day]) grouped[day] = [];
      grouped[day].push(anime);
    });

    console.log('📊 Días encontrados:', Object.keys(grouped));

    // ✅ ORDEN IGUAL AL ORIGINAL (sin Futuros para carrusel)
    const order = [
      'Monday', 'Tuesday', 'Wednesday', 'Thursday', 
      'Friday', 'Saturday', 'Sunday'
    ];

    this.sections = order.map((day) => ({
      title: this.getDayName(day),
      type: day.toLowerCase(),
      // ✅ SIN FILTROS ESTRICTOS - usar todos como el original
      animes: grouped[day] || []
    }));

    // Debug
    this.sections.forEach(section => {
      console.log(`${section.title}: ${section.animes.length} animes`);
      if (section.animes.length > 0) {
        console.log('Ejemplos:', section.animes.slice(0, 3).map(a => a.title));
      }
    });
  }

  private getDayName(day: string): string {
    const dayNames: Record<string, string> = {
      'Monday': 'Lunes', 'Tuesday': 'Martes', 'Wednesday': 'Miércoles',
      'Thursday': 'Jueves', 'Friday': 'Viernes', 
      'Saturday': 'Sábado', 'Sunday': 'Domingo'
    };
    return dayNames[day] || day;
  }
}