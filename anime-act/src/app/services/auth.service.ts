import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'http://localhost:4000/api';

  constructor(private http: HttpClient, private router: Router) {}

  login(email: string, password: string) {
    const normalizedEmail = email.toLowerCase().trim();
    return this.http.post<any>(`${this.apiUrl}/login`, {
      email: normalizedEmail,
      password
    }).pipe(
      map(response => {
        if (response.token) {
          localStorage.setItem('token', response.token);
          localStorage.setItem('user', JSON.stringify(response.user));
          console.log('Token guardado:', response.token);
        }
        return response;
      })
    );
  }

  register(username: string, email: string, password: string) {
    const normalizedEmail = email.toLowerCase().trim();
    return this.http.post<any>(`${this.apiUrl}/register`, {
      username,
      email: normalizedEmail,
      password
    });
  }

  saveAnimeStatus(animeId: number, status: string) {
    const token = this.getToken();
    if (!token) {
      console.error('Token no encontrado en localStorage');
      throw new Error('No se encontró el token de autenticación');
    }
    console.log('Token enviado:', token);
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
    return this.http.post(`${this.apiUrl}/anime/status`, 
      { animeId, status }, 
      { headers }
    );
  }

  getUserAnimes() {
    const token = this.getToken();
    if (!token) {
      console.error('Token no encontrado en localStorage');
      throw new Error('No se encontró el token de autenticación');
    }
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
    const userId = JSON.parse(localStorage.getItem('user') || '{}').id;
    return this.http.get(`${this.apiUrl}/anime/status/${userId}`, { headers });
  }
  // Eliminar estado de anime
deleteAnimeStatus(animeId: number, status: string) {
  const token = this.getToken();
  const headers = new HttpHeaders({
    'Authorization': `Bearer ${token}`
  });

  return this.http.request('delete', `${this.apiUrl}/anime/status`, {
    headers,
    body: { animeId, status }
  });
}


  getToken(): string | null {
    const token = localStorage.getItem('token');
    console.log('Token obtenido:', token);
    return token;
  }

  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    this.router.navigate(['/login']);
  }

  isLoggedIn(): boolean {
    const isLogged = !!this.getToken();
    console.log('Estado de login:', isLogged);
    return isLogged;
  }
}