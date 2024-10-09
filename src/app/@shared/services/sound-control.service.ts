import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SoundControlService {
  private soundEnabled = false;
  private activeTabId: string | null = null;
  private previousTabId: string | null = null;
  private soundEnabledSubject = new BehaviorSubject<boolean>(false);
  soundEnabled$ = this.soundEnabledSubject.asObservable();

  constructor() {
    this.initTabId();
    this.initStorageListener();
    this.initVisibilityListener();
  }

  enableSound(): void {
    if (!this.soundEnabled) {
      this.soundEnabled = true;
      this.updateSoundState();
    }
  }

  disableSound(): void {
    if (this.soundEnabled) {
      this.soundEnabled = false;
      this.updateSoundState();
    }
  }

  initTabId(): void {
    this.previousTabId = this.activeTabId;
    this.activeTabId = 'tab_' + Math.random().toString(36).substr(2, 9);
    localStorage.setItem('activeTabId', this.activeTabId);
    this.enableSound();
  }

  private updateSoundState(): void {
    const currentTabId = localStorage.getItem('activeTabId');
    const soundEnabled = currentTabId === this.activeTabId && this.soundEnabled; 
    this.soundEnabledSubject.next(soundEnabled);
    this.previousTabId = this.activeTabId;
    this.activeTabId = currentTabId;
  }

  initStorageListener(): void {
    window.addEventListener('storage', (event) => {
      if (event.key === 'activeTabId') {
        this.updateSoundState();
      }
    });
  }

  initVisibilityListener(): void {
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'hidden') {
        this.handleTabClose();
      }
    });
  }

  private handleTabClose(): void {
    if (this.previousTabId) {
      localStorage.setItem('activeTabId', this.previousTabId);
      this.activeTabId = this.previousTabId;
      this.soundEnabled = true;
      this.updateSoundState();
    }
  }
}
