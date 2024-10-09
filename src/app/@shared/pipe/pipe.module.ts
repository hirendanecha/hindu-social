import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SafePipe } from './safe.pipe';
import { GetImageUrlPipe } from './get-image-url.pipe';
import { CommaSeperatePipe } from './comma-seperate.pipe';
import { DateDayPipe } from './date-day.pipe';
import { NoSanitizePipe } from './sanitize.pipe';
import { MessageTimePipe } from './message-time.pipe';
import { MessageDatePipe } from './message-date.pipe';
import { SearchFilterPipe } from './search-filter.pipe';
import { HighlightPipe } from './hightlight-text.pipe';
import { RandomAdvertisementUrlPipe } from './random-advertisement.pipe';
import { StripHtmlPipe, TruncatePipe } from './post-description.pipe';

@NgModule({
  declarations: [
    SafePipe,
    GetImageUrlPipe,
    CommaSeperatePipe,
    DateDayPipe,
    NoSanitizePipe,
    MessageTimePipe,
    MessageDatePipe,
    SearchFilterPipe,
    HighlightPipe,
    RandomAdvertisementUrlPipe,
    TruncatePipe,
    StripHtmlPipe
  ],
  imports: [CommonModule],
  exports: [
    SafePipe,
    GetImageUrlPipe,
    CommaSeperatePipe,
    DateDayPipe,
    NoSanitizePipe,
    MessageTimePipe,
    MessageDatePipe,
    SearchFilterPipe,
    HighlightPipe,
    RandomAdvertisementUrlPipe,
    TruncatePipe,
    StripHtmlPipe
  ],
})
export class PipeModule {}
