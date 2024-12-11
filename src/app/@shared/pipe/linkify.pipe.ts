import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'linkify'
})
export class LinkifyPipe implements PipeTransform {

  transform(value: string): string {
    if (!value) return value;
    
    const urlRegex = /(?:https?:\/\/|www\.)[^\s<&]+(?:\.[^\s<&]+)+(?:\.[^\s<]+)?/g;
    return value.replace(urlRegex, (url, offset) => {
      const beforeUrl = value.substring(0, offset);
      const insideAnchorTag = /<a[^>]*href=['"]?[^'"]*$/i.test(beforeUrl);
      if (insideAnchorTag) {
        return url;
      }
      const insideImgTag = /<img[^>]*src=['"]?[^'"]*$/i.test(beforeUrl);
      if (insideImgTag) {
        return url;
      }
      if (url.startsWith('www') && !/^https?:\/\//.test(url)) {
        url = 'http://' + url;
      }
      if (url.trim().endsWith('.gif')) {
        return url;
      }
      return `<a href="${url}" target="_blank">${url}</a>`;
    });
  }
}
