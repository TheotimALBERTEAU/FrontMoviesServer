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

  // --- VARIABLES DISTINCTES ---
  public tempBannerColor = '#4a0000';
  public tempBannerUrl = '';

  public tempAvatarColor = '#4a0000';
  public tempAvatarUrl = '';

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
        this.initLocalSettings(user);
      }
    });
  }

  initLocalSettings(user: any) {
    const settings = user.profileSettings;

    // Setup Bannière
    const bValue = settings?.bannerColor || this.DEFAULT_RED;
    this.tempBannerColor = bValue.startsWith('#') ? bValue : this.DEFAULT_RED;
    this.tempBannerUrl = bValue.startsWith('http') ? bValue : '';

    // Setup Avatar
    const aValue = settings?.profilePic || this.DEFAULT_RED;
    this.tempAvatarColor = aValue.startsWith('#') ? aValue : this.DEFAULT_RED;
    this.tempAvatarUrl = aValue.startsWith('http') ? aValue : '';
    this.showInitial = !aValue.startsWith('http');
  }

  toggleEdit() {
    this.isEditing = !this.isEditing;
    this.editTarget = null;
    this.showConfirmPopup = false;
    if (!this.isEditing) this.initLocalSettings(this.authService.currentUser);
  }

  openSelector(target: 'avatar' | 'banner') {
    this.editTarget = target;
  }

  async confirmUpdate() {
    const userId = this.authService.getUserId();
    if (!userId) return;

    // On calcule les valeurs finales indépendamment
    const finalBanner = this.tempBannerUrl.startsWith('http') ? this.tempBannerUrl : this.tempBannerColor;
    const finalAvatar = this.tempAvatarUrl.startsWith('http') ? this.tempAvatarUrl : this.tempAvatarColor;

    const newSettings = {
      userId,
      bannerColor: finalBanner,
      profilePic: finalAvatar
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

  // --- RENDU BANNIÈRE ---
  getBannerColor() {
    const val = this.authService.currentUser?.profileSettings?.bannerColor;
    return val?.startsWith('#') ? val : this.DEFAULT_RED;
  }

  getBannerImage() {
    const val = this.authService.currentUser?.profileSettings?.bannerColor;
    return val?.startsWith('http') ? `url(${val})` : 'none';
  }

  // --- RENDU AVATAR ---
  getAvatarColor() {
    const val = this.authService.currentUser?.profileSettings?.profilePic;
    return val?.startsWith('#') ? val : this.DEFAULT_RED;
  }

  getAvatarImage() {
    const val = this.authService.currentUser?.profileSettings?.profilePic;
    return val?.startsWith('http') ? `url(${val})` : 'none';
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
