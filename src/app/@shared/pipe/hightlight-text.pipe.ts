// import { Pipe, PipeTransform } from '@angular/core';

// @Pipe({
//   name: 'highlight',
// })
// export class HighlightPipe implements PipeTransform {
//   transform(text: string, search: string): string {
//     if (!search) {
//       return text;
//     }
//     const regex = new RegExp(`(${search})`, 'gi');
//     return text.replace(regex, '<span class="highlight">$1</span>');
//   }
// }


import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'highlight',
})
export class HighlightPipe implements PipeTransform {
  transform(text: string, search: string): string {
    if (!search) {
      return text;
    }
    
    const parser = new DOMParser();
    const doc = parser.parseFromString(text, 'text/html');

    this.highlightTextNodes(doc.body, search);

    return doc.body.innerHTML;
  }

  private highlightTextNodes(element: Node, search: string) {
    if (element.nodeType === Node.TEXT_NODE) {
      const regex = new RegExp(`(${search})`, 'gi');
      const wrapper = document.createElement('span');
      wrapper.innerHTML = element.nodeValue.replace(regex, '<span class="highlight">$1</span>');
      element.parentNode.replaceChild(wrapper, element);
    } else {
      element.childNodes.forEach(child => this.highlightTextNodes(child, search));
    }
  }
}
