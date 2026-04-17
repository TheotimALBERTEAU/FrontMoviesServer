import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { Auth } from '../../../services/Users/auth';
import { Profile } from '../../../services/Users/profile';
import { Favorites } from '../../../services/Favorites/favorites';
import { CommonModule } from '@angular/common';
import {MoviesList} from '../../../services/Movies/movies-list';
import {RelativeTimePipe} from '../../../pipes/relative-time-pipe';
import {ActivatedRoute} from '@angular/router';
import {FormsModule} from '@angular/forms';

@Component({
  selector: 'app-profile-page',
  standalone: true,
  imports: [CommonModule, RelativeTimePipe, FormsModule],
  templateUrl: './profile-page.html',
  styleUrl: './profile-page.css',
})
export class ProfilePage implements OnInit {
  public activeTab: 'favorites' | 'history' = 'favorites';
  public historyData: any[] = [];
  public favoritesData: any[] = [];

  // Pagination
  public currentPage = 1;
  public pageSize = 24;

  public isEditing = false;
  public editTarget: 'avatar' | 'banner' | null = null;
  public showInitial = true;
  public tempColor = '#4a0000';
  public tempUrl = '';
  public DEFAULT_RED = '#4a0000';

  public showConfirmPopup = false;

  constructor(
    private route: ActivatedRoute,
    public authService: Auth,
    private profileService: Profile,
    public moviesService: MoviesList,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      if (params['tab']) { this.activeTab = params['tab']; }
    });

    this.authService.checkAuth().subscribe(user => {
      if (user) {
        this.loadHistory();
        this.loadFavoritesDetails();
        this.tempColor = user.profileSettings?.bannerColor || this.DEFAULT_RED;
        this.tempUrl = user.profileSettings?.profilePic || '';
      }
    });
  }

  toggleEdit() {
    this.isEditing = !this.isEditing;
    this.editTarget = null;
    this.showConfirmPopup = false;
  }

  openSelector(target: 'avatar' | 'banner') {
    this.editTarget = target;
  }

  async confirmUpdate() {
    const userId = this.authService.getUserId();
    if (!userId) return;

    const finalValue = this.tempUrl.startsWith('http') ? this.tempUrl : this.tempColor;

    const newSettings = {
      userId,
      bannerColor: this.editTarget === 'banner' ? finalValue : this.authService.currentUser?.profileSettings?.bannerColor,
      profilePic: this.editTarget === 'avatar' ? (this.showInitial ? '' : this.tempUrl) : this.authService.currentUser?.profileSettings?.profilePic
    };

    this.profileService.updateProfile(newSettings).subscribe({
      next: (res: any) => {
        if (res.code === "200") {
          this.authService.currentUser.profileSettings = newSettings;
          this.isEditing = false;
          this.showConfirmPopup = false;
          this.cdr.detectChanges();
        }
      }
    });
  }

  getBannerColor() {
    const settings = this.authService.currentUser?.profileSettings;
    return settings?.bannerColor?.startsWith('#') ? settings.bannerColor : this.DEFAULT_RED;
  }

  getBannerImage() {
    const settings = this.authService.currentUser?.profileSettings;
    return settings?.bannerColor?.startsWith('http') ? `url(${settings.bannerColor})` : 'none';
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
