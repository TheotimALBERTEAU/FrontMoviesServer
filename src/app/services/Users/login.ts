import { Injectable } from '@angular/core';
import {Router} from '@angular/router';
import {HttpClient} from '@angular/common/http';
import {environment} from '../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class Login {
  constructor(private http: HttpClient,
              private router: Router) {
  }

  public ApiUrl: string = environment.apiUrl;

  public sendLogin(email : string, password : string) {
    const infos = {
      "email": email,
      "password": password,
    }

    this.http.post(`${this.ApiUrl}/users/login`, infos, {withCredentials: true}).subscribe({
      next: (response: any) => {
        if (response.code == "200") {
          alert("Login successfull");
          this.router.navigate([`/`]);
        } else {
          alert("Email/Password Invalid");
        }
      }
    })
  }
  public passwordInputType: 'password' | 'text' = 'password';

  public togglePasswordVisibility(field: 'password' | 'confirm'): void {
    if (field === 'password') {
      this.passwordInputType = this.passwordInputType === 'password' ? 'text' : 'password';
    }
  }
}
