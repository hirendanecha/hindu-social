import { Pipe, PipeTransform, ChangeDetectorRef, NgZone, OnDestroy } from '@angular/core';

@Pipe({
  name: 'dateDay',
  pure: false
})
export class DateDayPipe implements PipeTransform, OnDestroy {
  private lastUpdate: number;
  private interval: any;
  constructor(private cd: ChangeDetectorRef, private ngZone: NgZone) {}

  transform(value: string): string {
    const currentDate = new Date();
    const postDate = new Date(value);
    const diffInTime = currentDate.getTime() - postDate.getTime();
    const diffInSeconds = Math.round(diffInTime / 1000);
    const diffInMinutes = Math.round(diffInTime / (1000 * 60));
    const diffInHours = Math.round(diffInTime / (1000 * 3600));
    const diffInDays = Math.round(diffInTime / (1000 * 3600 * 24));

    if (diffInSeconds <= 60) {
      return 'just now';
    } else if (diffInMinutes < 60) {
      this.setupAutoUpdate(60000);
      return `${diffInMinutes}min ago`;
    } else if (diffInHours < 24) {
      this.setupAutoUpdate(3600000);
      return `${diffInHours}h ago`;
    } else if (diffInDays === 1) {
      return '1 day ago';
    } else {
      return `${diffInDays} days ago`;
    }
  }

  private setupAutoUpdate(updateInterval: number): void {
    const currentDate = new Date().getTime();
    if (!this.lastUpdate || (currentDate - this.lastUpdate) > updateInterval) {
      this.ngZone.runOutsideAngular(() => {
        if (this.interval) {
          clearTimeout(this.interval);
        }
        this.interval = setTimeout(() => {
          this.cd.markForCheck();
        }, updateInterval);
      });
      this.lastUpdate = currentDate;
    }
  }

  ngOnDestroy(): void {
    if (this.interval) {
      clearTimeout(this.interval);
    }
  }
}
