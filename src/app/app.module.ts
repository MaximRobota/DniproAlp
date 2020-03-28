import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ReactiveFormsModule } from '@angular/forms';

import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';

import { AppComponent } from './components/app.component';
import { HomeComponent } from './components/home.component';
import { AdminComponent } from './admin/admin.component';
import { LoginComponent } from './admin/login/login.component';
import { MainLoadingComponent } from './components/loading/loading.component';
// import { ConfigService } from './services/config.service';

import { SlickCarouselModule } from 'ngx-slick-carousel';
import { CollapseModule, ModalModule } from 'ngx-bootstrap';
import { ToasterModule } from 'angular2-toaster';


import { HttpClient, HttpClientModule } from '@angular/common/http';
import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { routing } from './app-routing.module';
import { DashboardComponent } from './admin/dashboard/dashboard.component';
import { AuthGuard } from './admin/role.guard';
import { AuthenticationService } from './_services';
import { LoadingDirective } from './directives/loading.directive';

export function HttpLoaderFactory(httpClient: HttpClient) {
  return new TranslateHttpLoader(httpClient);
}

@NgModule({
  declarations: [
    AppComponent,
    HomeComponent,
    MainLoadingComponent,
    AdminComponent,
    DashboardComponent,
    LoginComponent,
    LoadingDirective
    // ConfigService
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
    AuthGuard,
    AuthenticationService
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
