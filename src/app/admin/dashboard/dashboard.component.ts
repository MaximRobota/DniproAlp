import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import {BsModalService} from 'ngx-bootstrap';
import {TranslateService} from '@ngx-translate/core';
import {ToasterService} from 'angular2-toaster';
import {FormBuilder} from '@angular/forms';

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
    this.sendler().subscribe((data) => {
          console.log(data);
          this.claims = data;
          toasterService.pop('success', '', 'Спасибо. Заявка принята. В ближайшее время с Вами свяжется наш менеджер.');
        },
        error => {
          console.log(error.message);
          // toasterService.pop('error', '', err);
        });
  }
  loaded: boolean;
  claims: any;

  // elements: any = [
  //   {id: 1, first: 'Mark', last: 'Otto', handle: '@mdo'},
  //   {id: 2, first: 'Jacob', last: 'Thornton', handle: '@fat'},
  //   {id: 3, first: 'Larry', last: 'the Bird', handle: '@twitter'},
  // ];
  //
  headElements = ['ID', 'Full Name', 'Phone', 'Email', 'Type', 'Message', 'Created At'];

  sendler() {
    this.loaded = false;
    return this
      .http
      .get(`${BACKEND_API_ENDPOINT}/claims`);
  }
}
