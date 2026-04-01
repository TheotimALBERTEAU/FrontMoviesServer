import { Component } from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Login} from '../../../services/Users/login'
import {FormsModule} from '@angular/forms';
import {Router} from '@angular/router';

@Component({
  selector: 'app-login-page',
  imports: [
    FormsModule
  ],
  templateUrl: './login-page.html',
  styleUrl: './login-page.css',
})
export class LoginPage {
  constructor(private http : HttpClient,
              public loginService : Login,
              private router: Router,) {}

  public email = '';
  public password = '';

  public onClickLogin() {
    this.loginService.sendLogin(this.email, this.password)
  }

  public onClickGoSignup() {
    this.router.navigate(['/signup']);
  }
}
