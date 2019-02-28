import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HttpClientModule, HttpClientJsonpModule } from '@angular/common/http';
import { HttpModule, Http } from '@angular/http';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { AppRoutingModule } from './app-routing.module';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { DatePipe } from '@angular/common'

import 'hammerjs';
import { ButtonsModule } from '@progress/kendo-angular-buttons';
import { GridModule, ExcelModule } from '@progress/kendo-angular-grid';
import { DropDownsModule } from '@progress/kendo-angular-dropdowns';
import { DateInputsModule } from '@progress/kendo-angular-dateinputs';
import { PopupModule } from '@progress/kendo-angular-popup';
import { DialogsModule } from '@progress/kendo-angular-dialog';
import { TooltipModule } from '@progress/kendo-angular-tooltip';
import { IntlModule } from '@progress/kendo-angular-intl';
import { ChartsModule } from '@progress/kendo-angular-charts';

import { AppComponent } from './app.component';
import { NavbarComponent } from './navbar/navbar.component';
import { WSRDATAComponent } from './wsrdata/wsrdata.component';
import { LoginPageComponent } from './login-page/login-page.component';
import { global } from './model';

@NgModule({
  declarations: [
    AppComponent,
    NavbarComponent,
    WSRDATAComponent,
    LoginPageComponent
  ],
  imports: [
    HttpClientModule,
    HttpClientJsonpModule,
    BrowserModule,
    BrowserAnimationsModule,
    ReactiveFormsModule,
    GridModule,
    ExcelModule,
    AppRoutingModule,
    NgbModule.forRoot(),
    FormsModule,
    HttpModule,
    ChartsModule,
    TooltipModule,
    ButtonsModule,
    DropDownsModule,
    DateInputsModule,
    PopupModule,
    DialogsModule,
    IntlModule
  ],
  providers: [global,
    DatePipe],
  bootstrap: [AppComponent]
})
export class AppModule { }
