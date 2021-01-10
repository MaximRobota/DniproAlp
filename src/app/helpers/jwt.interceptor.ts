import { catchError, tap } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { HttpRequest, HttpHandler, HttpResponse, HttpEvent, HttpInterceptor, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { Router } from '@angular/router';
import { UserService } from "../_services";

@Injectable()

export class JwtInterceptor implements HttpInterceptor {

  constructor(
    private router: Router,
    private userService: UserService,
  ) { }

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    // add auth header with jwt if user is logged in and request is to api url
    const currentUser = this.userService.currentUserValue;
    const isLoggedIn = currentUser && currentUser.auth_token;
    const isApiUrl = request.url.startsWith(environment.apiUrl);
    let isKeysToCamel = false;

    if (isLoggedIn && isApiUrl) {
      request = request.clone({
        setHeaders: {
          'Authorization': `Bearer ${currentUser.auth_token}`
        }
      });
    } else {
      return next.handle(request);
    }
    // @ts-ignore
    request.body = caseConverter(request.body);

    return next.handle(request).pipe(
      tap(evt => {
        if (evt instanceof HttpResponse) {
          // Todo if (evt.body && evt.body.meta.status) {
          if (evt.body) {
            isKeysToCamel = true;
            // @ts-ignore
            evt.body = caseConverter(evt.body);
          }
        }
      }),
      catchError((error) => {
        isKeysToCamel = true;
        error = caseConverter(error);
        this.handleAuthError(error);
        return of(error);
      }) as any);

    function caseConverter(o: any){
      if (o === Object(o) && !Array.isArray(o) && typeof o !== 'function') {
        const n = {};
        Object.keys(o)
          .forEach((k) => {
            isKeysToCamel ? n[toCamel(k)] = caseConverter(o[k]) : n[toKeys(k)] = caseConverter(o[k]);
          });
        return n;
      } else if (Array.isArray(o)) {
        return o.map((i) => {
          return caseConverter(i);
        });
      }
      return o;
    }

    function toCamel(s: string) {
      return s.replace(/([-_][a-z])/ig, ($1) => {
        return $1.toUpperCase()
          .replace('-', '')
          .replace('_', '');
      });
    }

    function toKeys(s: string) {
      return s.match(/[A-Z]{2,}(?=[A-Z][a-z]+[0-9]*|\b)|[A-Z]?[a-z]+[0-9]*|[A-Z]|[0-9]+/g)
        .map(x => x.toLowerCase())
        .join('_');
    }
  }

  private handleAuthError(err: HttpErrorResponse): Observable<any> {
    if (err.status === 401) {
      console.log('Please refresh page. ' + err.status);
      this.router.navigate([`/admin`]);
      return of(err.message);
    }
    throw err;
  }
}
