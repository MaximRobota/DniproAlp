import { Injectable } from '@angular/core';
// import { Http, Headers, RequestOptions, Response } from '@angular/http';
// import 'rxjs/add/operator/map';

// import { AuthenticationService } from './index';

@Injectable()
export class UserService {
    constructor(
        // private http: Http,
        // private authenticationService: AuthenticationService
    ) {
    }

    getUsers() {
        // add authorization header with jwt token
        // const headers = new Headers({ 'Authorization': 'Bearer ' + this.authenticationService.currentUser.jwt_token });
        // const options = new RequestOptions({ headers: headers });

        // get users from api
        // return this.http.get(this.authenticationService.apiUrl + '?access_token=' + this.authenticationService.apiAccessToken
        //   + '&content_type=user&select=fields.name,fields.password', options)
        //     .map((response: Response) => response.json());

      return true;
    }
}
