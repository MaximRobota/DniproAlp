import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import {Observable} from 'rxjs';
import {tap} from 'rxjs/operators';

export interface Claim {
  _id: string;
  fullName: string;
  phone: string;
  email: string;
  type: string;
  message: string;
  created_at: string;
}
declare var BACKEND_API_ENDPOINT: any;

@Injectable({providedIn: 'root'})
export class AdminClaimListService {
  public claims: Claim[] = [];
  constructor( private http: HttpClient ) { }

  getClaims(): Observable<any> {
    return this.http.get(`${BACKEND_API_ENDPOINT}/claims`)
      .pipe(tap(response => this.claims = response.claims));
  }
  removeClaim(id: string) {
    return this.http.delete(`${BACKEND_API_ENDPOINT}/claims/` + id)
      .pipe(tap(claims => {
        console.log(claims);
    }));
  }
}
