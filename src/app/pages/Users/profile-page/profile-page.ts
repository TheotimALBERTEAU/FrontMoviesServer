import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { Auth } from '../../../services/Users/auth';
import { Profile } from '../../../services/Users/profile';
import { Favorites } from '../../../services/Favorites/favorites';
import { CommonModule } from '@angular/common';
import {MoviesList} from '../../../services/Movies/movies-list';
import {RelativeTimePipe} from '../../../pipes/relative-time-pipe';
import {ActivatedRoute} from '@angular/router';

@Component({
  selector: 'app-profile-page',
  standalone: true,
  imports: [CommonModule, RelativeTimePipe],
  templateUrl: './profile-page.html',
  styleUrl: './profile-page.css',
})
export class ProfilePage {
  public activeTab: 'favorites' | 'history' = 'favorites';
  public historyData: any[] = [];
  public favoritesData: any[] = [];

  // Pagination
  public currentPage = 1;
  public pageSize = 24;

  public DEFAULT_RED = '#4a0000';

  constructor(
    private route: ActivatedRoute,
    public authService: Auth,
    private profileService: Profile,
    private favService: Favorites,
    public moviesService: MoviesList,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      if (params['tab']) {
        this.activeTab = params['tab'];
      }
    });

    this.authService.checkAuth().subscribe(user => {
      if (user) {
        this.loadHistory();
        this.loadFavoritesDetails();
      }
    });
  }

  getBannerColor() {
    const settings = this.authService.currentUser?.profileSettings;
    if (settings?.bannerColor?.startsWith('#')) {
      return settings.bannerColor;
    }
    return this.DEFAULT_RED;
  }

  getBannerImage() {
    const settings = this.authService.currentUser?.profileSettings;
    console.log(settings);
    if (settings?.bannerColor?.startsWith('https')) {
      return `url(${settings.bannerColor})`;
    }
    return 'none';
  }

  loadHistory() {
    const userId = this.authService.getUserId();
    if (!userId) return;
    this.profileService.getUserHistory(userId).subscribe(res => {
      if (res.code === "200") {
        this.historyData = res.data;
        this.cdr.detectChanges();
      }
    });
  }

  loadFavoritesDetails() {
    const userId = this.authService.getUserId();
    if (!userId) return;
    this.profileService.getUserFavorites(userId).subscribe(res => {
      if (res.code == "200") {
        this.favoritesData = res.data;
        this.cdr.detectChanges();
      }
    });
  }

  get displayedItems() {
    const source = this.activeTab === 'history' ? this.historyData : this.favoritesData;
    const start = (this.currentPage - 1) * this.pageSize;
    return source.slice(start, start + this.pageSize);
  }

  setTab(tab: 'favorites' | 'history') {
    this.activeTab = tab;
    this.currentPage = 1;
  }

  hasNext(): boolean {
    const source = this.activeTab === 'history' ? this.historyData : this.favoritesData;
    return (this.currentPage * this.pageSize) < source.length;
  }

  onClickAddToHistory(item: any) {
    const userId = this.authService.getUserId();
    if (!userId || !item._id) return;

    // Mapping pour convertir tes types français en types Backend
    const typeMapping: { [key: string]: string } = {
      'Film': 'Movies',
      'Série': 'Series',
      'Animé': 'Animes'
    };
    const mediaType = typeMapping[item.type] || item.type;

    this.profileService.addToHistory(userId, item._id, mediaType).subscribe({
      next: (data: any) => {
        if (data.code === "200") {
          console.log('Historique mis à jour avec le type :', mediaType);
        }
      }
    });
  }
}
