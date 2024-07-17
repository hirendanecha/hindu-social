import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'messageTime'
})
export class MessageTimePipe implements PipeTransform {

  transform(value: string): string {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const currentDate = new Date();
    const targetDate = new Date(value);
    const diffInTime = currentDate.getTime() - targetDate.getTime();
    const diffInSeconds = Math.round(diffInTime / 1000);
    const diffInMinutes = Math.round(diffInTime / (1000 * 60));
    const diffInHours = Math.round(diffInTime / (1000 * 3600));
    const diffInDays = Math.round(diffInTime / (1000 * 3600 * 24));
    const diffInWeeks = Math.round(diffInDays / 7);

    if (diffInSeconds <= 60) {
      return 'just now';
    }

    if (diffInMinutes < 60) {
      return `${diffInMinutes}min`;
    }

    if (diffInHours < 24) {
      return `${diffInHours}h`;
    }
    
    if (diffInDays < 7) {
      return `${days[targetDate.getDay()]}`;
    }

    if (diffInWeeks === 1) {
      return '1 week ago';
    }

    if (diffInWeeks > 1 && diffInWeeks < 4) {
      return `${diffInWeeks} weeks ago`;
    }

    if (diffInDays >= 28) {
      const diffInMonths = Math.round(diffInDays / 30);
      return `${diffInMonths} month${diffInMonths > 1 ? 's' : ''} ago`;
    }

    // For older dates, return the actual date
    const formattedDate = targetDate.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      // hour: 'numeric',
      // minute: 'numeric',
      // hour12: true
    });

    return formattedDate;
  }
}