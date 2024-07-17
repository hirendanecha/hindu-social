import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'searchFilter',
})
export class SearchFilterPipe implements PipeTransform {
  transform(messages: any[], searchQuery: string): any[] {
    if (!messages || !searchQuery) {
      return messages;
    }
    return messages.filter((message) => {
      console.log('message', message);
      message.text?.toLowerCase().includes(searchQuery.toLowerCase());
    });
  }
}
