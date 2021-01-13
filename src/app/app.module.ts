import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { BrowserModule } from '@angular/platform-browser';
import { CollapseModule, ModalModule } from 'ngx-bootstrap';
import { FormsModule } from '@angular/forms';
import { HTTP_INTERCEPTORS, HttpClient, HttpClientModule } from '@angular/common/http';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { SlickCarouselModule } from 'ngx-slick-carousel';
import { ToasterModule } from 'angular2-toaster';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { TranslateModule, TranslateLoader } from '@ngx-translate/core';

import { JwtInterceptor } from "./helpers/jwt.interceptor";
import { LoadingDirective } from './directives/loading.directive';
import { routing } from './app-routing.module';

import { AdminComponent } from './admin/admin.component';
import { AppComponent } from './components/app.component';
import { DashboardComponent } from './admin/dashboard/dashboard.component';
import { HomeComponent } from './components/home.component';
import { LoginComponent } from './admin/login/login.component';
import { MainLoadingComponent } from './components/loading/loading.component';

export function HttpLoaderFactory(httpClient: HttpClient) {
  return new TranslateHttpLoader(httpClient);
}

@NgModule({
  declarations: [
    AdminComponent,
    AppComponent,
    DashboardComponent,
    HomeComponent,
    LoadingDirective,
    LoginComponent,
    MainLoadingComponent,
  ],
  imports: [
    routing,
    BrowserModule,
    BrowserAnimationsModule,
    FormsModule,
    ReactiveFormsModule,
    SlickCarouselModule,
    HttpClientModule,
    NgbModule,
    ToasterModule.forRoot(),
    ModalModule.forRoot(),
    TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
        useFactory: HttpLoaderFactory,
        deps: [HttpClient]
      }
    }),
    CollapseModule
  ],
  providers: [
    {
      provide: HTTP_INTERCEPTORS,
      useClass: JwtInterceptor, multi: true,
    },
    // {
    //   provide: RECAPTCHA_V3_SITE_KEY,
    //   useValue: environment.GOOGLE_RECAPTCHA_SITE_KEY
    // },
    // {
    //   provide: RECAPTCHA_LANGUAGE,
    //   useValue: 'us',
    // },
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
