import { Injectable } from '@angular/core';
import {Router} from '@angular/router';
import {HttpClient} from '@angular/common/http';
import {environment} from '../../../environments/environment';

@Injectable({
  providedIn: 'any',
})
export class Signup {
  constructor(private http: HttpClient, private router: Router) {}

  public ApiUrl: string = environment.apiUrl;

  // Types pour la visibilité dans le HTML
  public passwordInputType: 'password' | 'text' = 'password';
  public confirmInputType: 'password' | 'text' = 'password';

  public toggleVisibility(field: 'password' | 'confirm'): void {
    if (field === 'password') {
      this.passwordInputType = this.passwordInputType === 'password' ? 'text' : 'password';
    } else {
      this.confirmInputType = this.confirmInputType === 'password' ? 'text' : 'password';
    }
  }

  public sendSignup(email: string, password: string, passwordConfirm: string, pseudo: string) {
    const infos = {
      "email": email,
      "password": password,
      "passwordConfirm": passwordConfirm,
      "pseudo": pseudo
    };

    this.http.post(`${this.ApiUrl}/users/signup`, infos).subscribe({
      next: (response: any) => {
        if (response.code === "200") {
          alert("Compte créé avec succès !");
          this.router.navigate(['/login']);
        }
        else {
          alert(response.message || "Erreur lors de l'inscription");
        }
      }
    });
  }
}
