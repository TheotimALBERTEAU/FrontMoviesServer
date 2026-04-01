import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Signup } from '../../../services/Users/signup'
import {FormsModule} from '@angular/forms';
import {Router} from '@angular/router';

@Component({
  selector: 'app-signup-page',
  templateUrl: './signup-page.html',
  imports: [
    FormsModule
  ],
  styleUrls: ['./signup-page.css']
})
export class SignupPage {
  constructor(
    private http: HttpClient,
    public signupService: Signup,
    private router: Router
  ) {}

  public email = '';
  public password = '';
  public passwordConfirm = '';
  public pseudo = '';

  public onClickSignup() {
    this.signupService.sendSignup(
      this.email,
      this.password,
      this.passwordConfirm,
      this.pseudo
    );
  }

  public onClickGoLogin() {
    this.router.navigate(['/login']);
  }
}
