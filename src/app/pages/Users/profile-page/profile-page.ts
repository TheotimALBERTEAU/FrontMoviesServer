import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { Auth } from '../../../services/Users/auth';
import { Profile } from '../../../services/Users/profile';
import { Favorites } from '../../../services/Favorites/favorites';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-profile-page',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './profile-page.html',
  styleUrl: './profile-page.css',
})
export class ProfilePage {
  public activeTab: 'favorites' | 'history' = 'favorites';
  public historyData: any[] = [];
  public favoritesData: any[] = []; // Pour stocker les détails (covers) des favs

  // Pagination
  public currentPage = 1;
  public pageSize = 24; // 3 colonnes * 8 lignes

  public DEFAULT_RED = '#4a0000';

  constructor(
    public authService: Auth,
    private profileService: Profile,
    private favService: Favorites,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.authService.checkAuth().subscribe(user => {
      if (user) {
        this.loadHistory();
        this.loadFavoritesDetails();
      }
    });
  }

  getBannerColor() {
    const settings = this.authService.currentUser?.profileSettings;
    if (settings?.bannerColor?.startsWith('http')) {
      return this.DEFAULT_RED;
    }
    return settings?.bannerColor || this.DEFAULT_RED;
  }

  getBannerImage() {
    const settings = this.authService.currentUser?.profileSettings;
    if (settings?.bannerColor?.startsWith('http')) {
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
}
