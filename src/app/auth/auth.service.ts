import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  constructor() { }

  isLoggedIn() {
    if (localStorage.getItem('loggedInDetails')) {
      return true;
    }
    else {
      return false;
    }
  }
}
