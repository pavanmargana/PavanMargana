import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { WSRDATAComponent } from './wsrdata/wsrdata.component';
import { LoginPageComponent } from './login-page/login-page.component'

const routes: Routes = [
  {
    path: '',
    component: LoginPageComponent,
    pathMatch:'full'
  },
  {
    path: 'Login',
    component: LoginPageComponent,
    pathMatch:'full'
  },
  {
    path: 'WSRDATA',
    component: WSRDATAComponent
  },
];


@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
