import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import {ToasterService} from 'angular2-toaster';

declare var BACKEND_API_ENDPOINT: any;

@Component({
  selector: 'app-admin',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent {
  constructor(
    toasterService: ToasterService,
    private http: HttpClient,
  ) {
    this.loaded = false;
    this.getClaims();
  }
  loaded: boolean;
  claims: any;

  headElements = ['№', 'Full Name', 'Phone', 'Email', 'Type', 'Message', 'Created At', ''];

  sendler() {
    this.loaded = false;
    return this
      .http
      .get(`${BACKEND_API_ENDPOINT}/claims`)
      .subscribe((data: any) => {
          this.claims = data;
          // this.toasterService.pop('success', '', 'Спасибо. Заявка принята. В ближайшее время с Вами свяжется наш менеджер.');
        },
        error => {
          console.log(error.message);
          // this.toasterService.pop('error', '', error.message);
        });
  }

  getClaims() {
    this.sendler();
  }

  remove(claim) {
    this.http
      .delete(`${BACKEND_API_ENDPOINT}/claim/` + claim._id)
      .subscribe((data: any) => {
          const indexClaim = this.claims.map((e) => {
            return e._id;
          }).indexOf(data._id);
          if (indexClaim !== -1) {
            this.claims.splice(indexClaim, 1);
          }
          // this.toasterService.pop('success', '', 'Спасибо. Заявка принята. В ближайшее время с Вами свяжется наш менеджер.');
        },
        error => {
          console.log(error.message);
          // this.toasterService.pop('error', '', error.message);
        });
  }
}
