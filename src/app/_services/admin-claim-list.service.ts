import { environment } from "../../environments/environment";
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map } from 'rxjs/operators';

export interface Claim {
  id: string;
  fullName: string;
  phone: string;
  email: string;
  claimType: string;
  message: string;
  createdOn: string;
}

@Injectable({providedIn: 'root'})
export class AdminClaimListService {
  public claims: Claim[] = [];
  constructor( private http: HttpClient ) { }

  getClaims() {
    return  this.http.get(`${environment.apiUrl}/claims`)
      .pipe(map(
        (response: any) => this.claims = response.claims)
      );
  }

  removeClaim(id: string) {
    return this.http.delete(`${environment.apiUrl}/claims/` + id)
      .pipe();
  }
}
