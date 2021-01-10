import { Component, OnInit } from '@angular/core';
import { first } from "rxjs/operators";
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { UserService } from '../../_services/index';

@Component({
  templateUrl: 'login.component.html',
  styleUrls: ['login.component.css']
})

export class LoginComponent implements OnInit {

  constructor(
    private http: HttpClient,
    private router: Router,
    private userService: UserService,
  ) { }

  error = '';
  loading = false;
  model: any = {};

  ngOnInit() {
    this.userService.logout();
  }

  changeTypePassword() {
    const el = document.getElementById('changePassword');
    let type = el.getAttribute('type');
    return el.setAttribute('type', type = type === 'password' ? 'text' : 'password');
  }

  login() {
    this.loading = true;
    if (this.model.email && this.model.password) {
      this.userService.login(this.model.email, this.model.password)
        .pipe(first())
        .subscribe((user: any) => {
          if (user) {
            this.router.navigate(['/dashboard']);
          } else {
            this.error = 'Invalid name or password';
            this.loading = false;
          }
        },
          error => {
          this.error = 'Invalid name or password';
          this.loading = false;
        });
    }
  }

}
