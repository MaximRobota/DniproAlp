import { Routes, RouterModule } from '@angular/router';
import {LoginComponent} from './admin/login/login.component';
import {HomeComponent} from './components/home.component';
import {AuthGuard} from './admin/role.guard';
import {AdminComponent} from './admin/admin.component';
import {DashboardComponent} from './admin/dashboard/dashboard.component';


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
  // otherwise redirect to home
  { path: '**', redirectTo: '' }
];
export const routing = RouterModule.forRoot(appRoutes);
