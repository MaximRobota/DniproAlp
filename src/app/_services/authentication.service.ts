import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';

// import 'rxjs/add/operator/map';
declare var BACKEND_API_ENDPOINT: any;

@Injectable()
export class AuthenticationService {
    public apiUrl: string;
    public apiAccessToken: string;
    currentUser: any;
    constructor(private http: HttpClient) {
        if (BACKEND_API_ENDPOINT) {
            this.apiUrl = BACKEND_API_ENDPOINT;
        }
        // get token cookie
        this.currentUser = {jwt_token : getCookie('jwt_token')};
        function getCookie(name: string) {
            const matches = document.cookie.match(new RegExp(
                '(?:^|; )' + name.replace(/([\.$?*|{}\(\)\[\]\\\/\+^])/g, '\\$1') + '=([^;]*)'
            ));
            return matches ? decodeURIComponent(matches[1]) : undefined;
        }
    }

    login(username: string, password: string) {
        password = password.replace(/ /g, '%20');
        const data = new FormData();
        data.append('username', username);
        data.append('password', password);


        const date = new Date(new Date().getTime() + 60 * 100000);
        document.cookie = 'username=' + username + '; expires=' + date.toUTCString();
        document.cookie = 'id=' + 1 + '; expires=' + date.toUTCString();
        document.cookie = 'jwt_token=' + 'jwt_token' + '; expires=' + date.toUTCString();
        this.currentUser = {jwt_token: 'jwt_token'};
        return true;
        // return this.http.post(this.apiUrl + 'user/doLogin', data)
        // .map((response: Response) => {
        //   if (response.json().result !== false) {
        //       const date = new Date(new Date().getTime() + 60 * 100000);
        //       document.cookie = 'username=' + username + '; expires=' + date.toUTCString();
        //       document.cookie = 'id=' + response.json().result.user_id + '; expires=' + date.toUTCString();
        //       document.cookie = 'jwt_token=' + response.json().result.jwt_token + '; expires=' + date.toUTCString();
        //       this.currentUser = {jwt_token: response.json().result.jwt_token};
        //       return true;
        //   } else {
        //       return false;
        //   }
        // })
        // .catch(err => {
        //   if (err.status === 401) {
        //      return Observable.throw(err);
        //   }
        // });
    }
  logout(): void {
        // clear token remove user from local storage to log user out
        this.currentUser.jwt_token = null;
        const date = new Date(new Date().getTime() + 1000);
        document.cookie = 'username=' + 0 + '; expires=' + date.toUTCString();
        document.cookie = 'jwt_token=' + 0 + '; expires=' + date.toUTCString();
        document.cookie = 'id=' + 0 + '; expires=' + date.toUTCString();
    }
}
