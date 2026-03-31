import { Component } from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Login} from '../../../services/Users/login'
import {FormsModule} from '@angular/forms';

@Component({
  selector: 'app-login-page',
  imports: [
    FormsModule
  ],
  templateUrl: './login-page.html',
  styleUrl: './login-page.css',
})
export class LoginPage {
  public email = '';
  public password = '';

  constructor(private http : HttpClient,
              public loginService : Login) {}

  public onClickLogin() {
    this.loginService.sendLogin(this.email, this.password)
  }
}
