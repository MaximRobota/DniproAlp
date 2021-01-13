import { catchError, map } from 'rxjs/operators';
import { environment } from "../../environments/environment";
import { HttpClient } from "@angular/common/http";
import { Injectable } from '@angular/core';
import { User } from "../interfaces/user.interface";

@Injectable({
  providedIn: 'root'
})
export class UserService {
  public currentUser: any;

  constructor(
    private http: HttpClient
  ) {
    this.currentUser = {auth_token : getCookie('auth_token')};

    function getCookie(name: string) {
      const matches = document.cookie.match(new RegExp(
        '(?:^|; )' + name.replace(/([\.$?*|{}\(\)\[\]\\\/\+^])/g, '\\$1') + '=([^;]*)'
      ));
      return matches ? decodeURIComponent(matches[1]) : undefined;
    }
  }

  public get currentUserValue(): User {
    return this.currentUser;
  }

  getUser() {
    return this.currentUser.user;
  }

  login(email: string, password: string) {
    password = password.replace(/ /g, '%20');

    return  this.http.post<any>(`${environment.apiUrl}/auth/login`, { email, password })
      .pipe(map(
        response => {
          if (response && response.auth_token) {
            const user = response.user;
            const date = new Date(new Date().getTime() + 60 * 100000);
            document.cookie = 'email=' + user.email + '; expires=' + date.toUTCString();
            document.cookie = 'id=' + user.id + '; expires=' + date.toUTCString();
            document.cookie = 'auth_token=' + response.auth_token + '; expires=' + date.toUTCString();

            this.currentUser = response;
          }

          return response;
        })
      );
  }

  logout() {
    return this.http.get(`${environment.apiUrl}/auth/logout`)
      .pipe(
        map((response: any) => {
          if (response.status === "success") {
            this.currentUser.auth_token = null;
            const date = new Date(new Date().getTime() + 1000);
            document.cookie = 'email=' + 0 + '; expires=' + date.toUTCString();
            document.cookie = 'auth_token=' + 0 + '; expires=' + date.toUTCString();
            document.cookie = 'id=' + 0 + '; expires=' + date.toUTCString();
            return true;
          } else {
            return false;
          }
        }),
        catchError((err) => {
          if (err.status === 401) {
            return err;
          }
        })
      );
  }

}
