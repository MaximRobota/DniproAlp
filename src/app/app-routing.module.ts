import { AuthGuard } from './helpers/auth.guard';
import { DashboardComponent } from './admin/dashboard/dashboard.component';
import { HomeComponent } from './components/home.component';
import { LoginComponent } from './admin/login/login.component';
import { Routes, RouterModule } from '@angular/router';

const appRoutes: Routes = [
  {
    path: '',
    component: HomeComponent,
  },
  {
    path: 'admin',
    component: LoginComponent,
  }, {
    path: 'dashboard',
    component: DashboardComponent,
    canActivate: [AuthGuard]
  },
  {
    path: '**', redirectTo: ''
  }
];
export const routing = RouterModule.forRoot(appRoutes);
