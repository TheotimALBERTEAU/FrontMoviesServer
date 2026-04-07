import { Routes } from '@angular/router';
import {HomePage} from './pages/Movies/home-page/home-page';
import {MoviePage} from './pages/Movies/movie-page/movie-page';
import {LoginPage} from './pages/Users/login-page/login-page';
import {SignupPage} from './pages/Users/signup-page/signup-page';
import {MovieListPage} from './pages/Movies/movie-list-page/movie-list-page';
import {GenrePage} from './pages/Movies/genre-page/genre-page';
import {SearchPage} from './pages/Movies/search-page/search-page';
import {ActorsListPage} from './pages/Actors/actors-list-page/actors-list-page';
import {ActorPage} from './pages/Actors/actor-page/actor-page';

export const routes: Routes = [
  {path: '', component: HomePage},
  {path: 'movies', component: MovieListPage},
  {path: 'movies/:slug', component: MoviePage},
  {path: 'login', component: LoginPage},
  {path: 'signup', component: SignupPage},
  { path: 'genre/:type', component: GenrePage },
  { path: 'search/:query', component: SearchPage },
  { path: 'actors', component: ActorsListPage},
  { path: 'actor/:slug', component: ActorPage},
];
