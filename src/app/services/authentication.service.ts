import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class AuthenticationService {

  constructor() { }

  isUserAuthenticated(): boolean {
    return localStorage.getItem('$token') !== null;
  }

  logout(): void {
    localStorage.clear();
  }

  getAccessToken(): string | null {
    return localStorage.getItem('$token');
  }
}
