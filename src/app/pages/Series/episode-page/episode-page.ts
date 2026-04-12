import {ChangeDetectorRef, Component, OnInit} from '@angular/core';
import {WatchSerie} from '../../../services/Series/watch-serie';
import {ActivatedRoute} from '@angular/router';
import {NgIf} from '@angular/common';

@Component({
  selector: 'app-episode-page',
  imports: [
    NgIf
  ],
  templateUrl: './episode-page.html',
  styleUrl: './episode-page.css',
})
export class EpisodePage implements OnInit {
  constructor(private watchSerie: WatchSerie,
              private activatedRoute: ActivatedRoute,
              private cdr: ChangeDetectorRef) {
  }

  public episode: any = {};

  ngOnInit() {
    const slug = this.activatedRoute.snapshot.paramMap.get('slug');
    const seasonNum = this.activatedRoute.snapshot.paramMap.get('season') || '1';
    const episodeNum = this.activatedRoute.snapshot.paramMap.get('episode') || '1';

    if (slug) {
      this.watchSerie.getEpisode(slug, parseInt(seasonNum), parseInt(episodeNum)).subscribe({
        next: (data: any) => {
          this.episode = data.data;
          this.cdr.detectChanges();
        }
      })
    }
  }
}
