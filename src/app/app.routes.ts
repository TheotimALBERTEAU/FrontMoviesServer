import { Routes } from '@angular/router';
import {HomePage} from './pages/Home/home-page/home-page';
import {MoviePage} from './pages/Movies/movie-page/movie-page';
import {LoginPage} from './pages/Users/login-page/login-page';
import {SignupPage} from './pages/Users/signup-page/signup-page';
import {MovieListPage} from './pages/Movies/movie-list-page/movie-list-page';
import {GenrePage} from './pages/Genre/genre-page/genre-page';
import {SearchPage} from './pages/Search/search-page/search-page';
import {ActorsListPage} from './pages/Actors/actors-list-page/actors-list-page';
import {ActorPage} from './pages/Actors/actor-page/actor-page';
import {SerieListPage} from './pages/Series/serie-list-page/serie-list-page';
import {SeriePage} from './pages/Series/serie-page/serie-page';
import {EpisodePage as SeriesEpisodePage} from './pages/Series/episode-page/episode-page';
import {AnimeListPage} from './pages/Animes/anime-list-page/anime-list-page';
import {AnimePage} from './pages/Animes/anime-page/anime-page';
import {EpisodePage as AnimesEpisodePage} from './pages/Animes/episode-page/episode-page';
import {ProfilePage} from './pages/Users/profile-page/profile-page';

export const routes: Routes = [
  {path: '', component: HomePage},
  {path: 'movies', component: MovieListPage},
  {path: 'movies/:slug', component: MoviePage},
  {path: 'series', component: SerieListPage},
  {path: 'series/:slug', component: SeriePage},
  {path: 'series/:slug/:season-:episode', component: SeriesEpisodePage},
  {path: 'animes', component: AnimeListPage},
  {path: 'animes/:slug', component: AnimePage},
  {path: 'animes/:slug/:season-:episode', component: AnimesEpisodePage},
  {path: 'login', component: LoginPage},
  {path: 'signup', component: SignupPage},
  {path: 'profile', component: ProfilePage},
  { path: 'genre/:type', component: GenrePage },
  { path: 'search/:query', component: SearchPage },
  { path: 'actors', component: ActorsListPage},
  { path: 'actor/:slug', component: ActorPage},
];
