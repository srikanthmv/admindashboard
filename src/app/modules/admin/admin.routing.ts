import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {AdminComponent} from './admin.component';
import {DashboardComponent} from './dashboard/dashboard.component';
import {UsersComponent} from './users/users.component';
import {AuthenticationGuard} from '../../guards/authentication.guard';

const routes: Routes = [
  {path: '', component: AdminComponent,
  children: [
    {path: '', redirectTo: 'users', pathMatch: 'full'},
    {path: 'dashboard', component: DashboardComponent},
    {path: 'users', component: UsersComponent}
  ]}
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AdminRouting {}
