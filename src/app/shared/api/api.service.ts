import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';

import { environment } from '../../../environments/environment';
import { Observable } from 'rxjs';
import { AuthService } from '../auth/auth.service';

const headers = new HttpHeaders();
headers.append('Content-Type', 'application/json');

@Injectable({
  providedIn: 'root',
})
export class ApiService {
  private baseUrl = environment.apiUrl;

  constructor(private http: HttpClient, private auth: AuthService) {}

  get(url: string): Observable<any> {
    this.addHeaders();
    const requestOptions = {
      headers: headers,
    };
    return this.http.get(`${this.baseUrl}/${url}`, requestOptions);
  }

  post(url: string, body: Object): Observable<any> {
    return this.http.post(`${this.baseUrl}/${url}`, body, { headers: headers });
  }

  put(url: string, body: Object): Observable<any> {
    this.addHeaders();
    return this.http.patch(`${this.baseUrl}/${url}`, body, {
      headers: headers,
    });
  }

  delete(url: string, id: string): Observable<any> {
    this.addHeaders();
    return this.http.delete(`${this.baseUrl}/${url}/${id}`, { headers: headers });
  }

  addHeaders(): void {
    headers.append('Authorization', `Bearer ${this.auth.getToken()}`);
  }
}
