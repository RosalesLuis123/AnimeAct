import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, Observable, of } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class AnimeService {
  private jikan = 'https://api.jikan.moe/v4';

  constructor(private http: HttpClient) {}

  getAnimesByCategory(category: string): Observable<any> {
    const cached = sessionStorage.getItem(`anime_${category}`);
    if (cached) return of(JSON.parse(cached));

    let request$: Observable<any>;

    switch (category) {
      case 'airing':
        request$ = this.http.get(`${this.jikan}/top/anime?filter=airing`);
        break;

      case 'popular':
        request$ = this.http.get(`${this.jikan}/top/anime`);
        break;

      case 'action':
        // 🔥 Animes más populares del género Acción
        request$ = this.http
          .get(`${this.jikan}/anime?q=&genres=1&order_by=score&sort=desc&limit=10`)
          .pipe(map((res: any) => ({ data: res.data || [] })));
        break;

      case 'upcoming':
        request$ = this.http.get(`${this.jikan}/seasons/upcoming`).pipe(
          map((res: any) => ({ data: res.data?.slice(0, 10) || [] }))
        );
        break;

      default:
        request$ = this.http.get(`${this.jikan}/top/anime`);
    }

    request$.subscribe((res) =>
      sessionStorage.setItem(`anime_${category}`, JSON.stringify(res))
    );

    return request$;
  }

  getAnimeDetails(id: number): Observable<any> {
    return this.http.get(`${this.jikan}/anime/${id}/full`);
  }
  // En anime.service.ts
getAiringSchedule(): Observable<any> {
  const cached = sessionStorage.getItem('anime_calendar');
  if (cached) return of(JSON.parse(cached));

  return this.http.get(`${this.jikan}/schedules`).pipe(
    map((res: any) => {
      const processed = res.data.reduce((acc: any, anime: any) => {
        const day = anime.broadcast?.day || 'monday';
        if (!acc[day]) acc[day] = [];
        acc[day].push(anime);
        return acc;
      }, {});
      return { data: processed };
    })
  );
  
}
getAnimesByGenre(genreId: number) {
  return this.http.get(`${this.jikan}/anime?genres=${genreId}&order_by=score&sort=desc&limit=20`);
}

}
