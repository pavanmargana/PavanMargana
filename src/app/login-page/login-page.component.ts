import { Component, OnInit, ViewEncapsulation, ViewChildren, AfterViewInit } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { global } from '../model';

@Component({
  selector: 'app-login-page',
  templateUrl: './login-page.component.html',
  styleUrls: ['./login-page.component.css'],
  encapsulation: ViewEncapsulation.None
})
export class LoginPageComponent implements OnInit, AfterViewInit {
  @ViewChildren('focusOnUserName') vc: any;
  model: any = {};
  constructor(private http: HttpClient, private router: Router, private _global: global) { }

  ngOnInit() {
  }

  private GetHttpHeaders(): HttpHeaders {
    var headers = new HttpHeaders();
    headers.append('Pragma', 'no-cache');
    headers.append('Cache-Control', 'private, no-cache, no-store, max-age=0, must-revalidate');
    headers.append('Content-Type', 'application/json');
    headers.append('Access-Control-Allow-Methods', '*');
    return headers;
  }

  ngAfterViewInit() {
    this.vc.first.nativeElement.focus();
  }

  public login(): void {
    let RequestURL = "http://localhost:4000/";
    let RequestBody: any;
    RequestBody = {
      UserId: this.model.username,
      Password: this.model.password
    };

    this.http.post<any>(RequestURL + 'Validate', RequestBody, { headers: this.GetHttpHeaders() }).subscribe(data => {
      if (data[0].Role != null && data[0].Role != undefined) {
        this._global.setvalue(data[0].Role);        
        this.router.navigate(['/WSRDATA']);
      }
      else {
        this.router.navigate(['/Login']);
      }
    }, err => {
      this.router.navigate(['/Login']);
    });
  }

}
