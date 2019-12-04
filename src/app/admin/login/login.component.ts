import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthenticationService } from '../../_services/index';
// import { Http } from '@angular/http';
import { HttpClient, HttpHeaders } from '@angular/common/http';

@Component({
  templateUrl: 'login.component.html',
  styleUrls: ['login.component.css']
})

export class LoginComponent implements OnInit {
  model: any = {};
  loading = false;
  error = '';
  changeTypePassword() {
    const el = document.getElementById('changePassword');
    let type = el.getAttribute('type');
    return el.setAttribute('type', type = type === 'password' ? 'text' : 'password');
  }
  constructor(
    private router: Router,
    private http: HttpClient,
    private authenticationService: AuthenticationService
  ) { }
  ngOnInit() {
    this.authenticationService.logout(); // reset login status
  }
  login() {
    this.loading = true;
    if (this.model.username === 'object' &&
      this.model.password === 'boolean') {
      this.authenticationService.login(this.model.username, this.model.password);

      this.router.navigate(['/dashboard']);
    } else {
      this.router.navigate(['/']);
    }
    // this.authenticationService.login(this.model.username, this.model.password)
    // .map(result => {
    //     if (result === true) {
    //         this.router.navigate(['/']);
    //     } else {
    //         this.error = 'Invalid name or password';
    //         this.loading = false;
    //     }
    // })
    //   .subscribe(
    //     result => { if (result === true) {
    //       this.router.navigate(['/']);
    //     } else {
    //       this.error = 'Invalid name or password';
    //       this.loading = false;
    //     } },
    //     err => { this.error = 'Invalid name or password';
    //       this.loading = false; },
    //     () => { console.log('Completed'); }
    //   );
  }
}
