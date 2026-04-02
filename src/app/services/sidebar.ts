import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class SidebarService {
  public isCollapsed = signal(false);

  toggle() {
    this.isCollapsed.update(v => !v);
  }
}
