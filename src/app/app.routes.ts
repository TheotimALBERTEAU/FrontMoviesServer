import { Routes } from '@angular/router';
import {HomePage} from './pages/Movies/home-page/home-page';
import {MoviePage} from './pages/Movies/movie-page/movie-page';

export const routes: Routes = [
  {path: 'movies', component: HomePage},
  {path: 'movies/:slug', component: MoviePage},
];
