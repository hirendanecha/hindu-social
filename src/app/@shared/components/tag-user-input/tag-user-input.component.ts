import {
  Component,
  ElementRef,
  EventEmitter,
  Input,
  OnChanges,
  OnDestroy,
  Output,
  Renderer2,
  SimpleChanges,
  ViewChild,
} from '@angular/core';
import { NgbDropdown } from '@ng-bootstrap/ng-bootstrap';
import { CustomerService } from '../../services/customer.service';
import { PostService } from '../../services/post.service';
import { NgxSpinnerService } from 'ngx-spinner';
import { SocketService } from '../../services/socket.service';
import { Subject, debounceTime, takeUntil } from 'rxjs';
import { MessageService } from '../../services/message.service';
import { EmojiPaths } from '../../constant/emoji';

@Component({
  selector: 'app-tag-user-input',
  templateUrl: './tag-user-input.component.html',
  styleUrls: ['./tag-user-input.component.scss'],
})
export class TagUserInputComponent implements OnChanges, OnDestroy {
  @Input('value') value: string = '';
  @Input('placeholder') placeholder: string = 'ss';
  @Input('isShowMetaPreview') isShowMetaPreview: boolean = true;
  @Input('isCopyImagePreview') isCopyImagePreview: boolean = true;
  @Input('isAllowTagUser') isAllowTagUser: boolean = true;
  @Input('isShowMetaLoader') isShowMetaLoader: boolean = true;
  @Input('isShowEmojis') isShowEmojis: boolean = false;
  @Input('isCustomeSearch') isCustomeSearch: number = null;
  @Output('onDataChange') onDataChange: EventEmitter<any> =
    new EventEmitter<any>();

  @ViewChild('tagInputDiv', { static: false }) tagInputDiv: ElementRef;
  @ViewChild('userSearchDropdownRef', { static: false, read: NgbDropdown })
  userSearchNgbDropdown: NgbDropdown;
  @Input() placement: string = 'bottom-end';
  metaDataSubject: Subject<void> = new Subject<void>();

  userList = [];
  userNameSearch = '';
  metaData: any = {};
  isMetaLoader: boolean = false;

  copyImage: any;

  emojiPaths = EmojiPaths;

  constructor(
    private renderer: Renderer2,
    private customerService: CustomerService,
    private postService: PostService,
    private spinner: NgxSpinnerService,
    private socketService: SocketService,
    private messageService: MessageService
  ) {
    this.metaDataSubject.pipe(debounceTime(5)).subscribe(() => {
      this.getMetaDataFromUrlStr();
      this.checkUserTagFlag();
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    const val = changes?.value?.currentValue;
    this.setTagInputDivValue(val);

    if (val === '') {
      this.clearUserSearchData();
      this.clearMetaData();
      this.onClearFile();
    } else {
      this.getMetaDataFromUrlStr();
      this.checkUserTagFlag();
    }
    // this.moveCursorToEnd()
  }

  ngOnDestroy(): void {
    this.metaDataSubject.next();
    this.metaDataSubject.complete();
  }

  messageOnKeyEvent(): void {
    this.metaDataSubject.next();
    this.emitChangeEvent();
  }

  // checkUserTagFlag1(): void {
  //   if (this.isAllowTagUser) {
  //     const htmlText = this.tagInputDiv?.nativeElement?.innerHTML || '';

  //     const atSymbolIndex = htmlText.lastIndexOf('@');

  //     if (atSymbolIndex !== -1) {
  //       this.userNameSearch = htmlText.substring(atSymbolIndex + 1);
  //       if (this.userNameSearch?.length > 2) {
  //         this.getUserList(this.userNameSearch);
  //       } else {
  //         this.clearUserSearchData();
  //       }
  //     } else {
  //       this.clearUserSearchData();
  //     }
  //   }
  // }
  checkUserTagFlag(): void {
    this.userList = [];
    if (this.isAllowTagUser) {
      let htmlText = this.tagInputDiv?.nativeElement?.innerHTML || '';
      htmlText = htmlText.replace(/<[^>]*>/g, '');

      const atSymbolIndex = htmlText.lastIndexOf('@');
      const validUserName = /^[A-Za-z0-9_]+$/.test('');
      if (atSymbolIndex !== -1) {
        this.userNameSearch = htmlText.substring(atSymbolIndex + 1);
        if (this.isCustomeSearch && this.userNameSearch.length > 0 && !validUserName) {
          this.getUserList(this.userNameSearch);
        } else {
          if (this.userNameSearch.length > 2 && !validUserName) {
            this.getUserList(this.userNameSearch);
          } else {
            this.clearUserSearchData();
          }
        }
      } else {
        this.clearUserSearchData();
      }
    }
  }

  getMetaDataFromUrlStr(): void {
    const htmlText = this.tagInputDiv?.nativeElement?.innerHTML || '';
    this.extractImageUrlFromContent(htmlText);
    if (htmlText === '') {
      this.onClearFile();
    }

    const text = htmlText.replace(/<br\s*\/?>|<[^>]*>/g, '');
    // const matches = text?.match(/(?:https?:\/\/|www\.)[^\s<]+(?:\s|<br\s*\/?>|$)/);
    const matches = text.match(/(?:https?:\/\/|www\.)[^\s<&]+(?:\.[^\s<&]+)+(?:\.[^\s<]+)?/g);
    const url = matches?.[0];
    if (url) {
      if (url !== this.metaData?.url) {
        // this.isMetaLoader = true;
        this.spinner.show();
        const unsubscribe$ = new Subject<void>();
        this.postService
          .getMetaData({ url })
          .pipe(takeUntil(unsubscribe$))
          .subscribe({
            next: (res: any) => {
              this.isMetaLoader = false;
              this.spinner.hide();
              if (res?.meta?.image) {
                const urls = res.meta?.image?.url;
                const imgUrl = Array.isArray(urls) ? urls?.[0] : urls;

                const metatitles = res?.meta?.title;
                const metatitle = Array.isArray(metatitles)
                  ? metatitles?.[0]
                  : metatitles;

                const metaurls = res?.meta?.url || url;
                const metaursl = Array.isArray(metaurls)
                  ? metaurls?.[0]
                  : metaurls;

                this.metaData = {
                  title: metatitle,
                  metadescription: res?.meta?.description,
                  metaimage: imgUrl,
                  metalink: metaursl,
                  url: url,
                };

                this.emitChangeEvent();
              } else {
                this.metaData.metalink = url;
              }
              this.spinner.hide();
            },
            error: () => {
              if (this.metaData.metalink === null || '') {
                this.metaData.metalink = url;
              }
              this.isMetaLoader = false;
              // this.clearMetaData();
              this.spinner.hide();
            },
            complete: () => {
              unsubscribe$.next();
              unsubscribe$.complete();
            },
          });
      }
    } else {
      this.clearMetaData();
      this.isMetaLoader = false;
    }
  }

  moveCursorToEnd(): void {
    const range = document.createRange();
    const selection = window.getSelection();
    const tagInputDiv = this.tagInputDiv?.nativeElement;
    if (tagInputDiv && tagInputDiv.childNodes.length > 0) {
      range.setStart(
        this.tagInputDiv?.nativeElement,
        this.tagInputDiv?.nativeElement.childNodes.length
      );
    }
    range.collapse(true);
    selection.removeAllRanges();
    selection.addRange(range);
  }

  selectTagUser(user: any): void {
    const htmlText = this.tagInputDiv?.nativeElement?.innerHTML || '';
    // const text = htmlText.replace(
    //   `@${this.userNameSearch}`,
    //   `<a href="/settings/view-profile/${user?.Id
    //   }" class="text-danger" data-id="${user?.Id}">@${user?.Username.split(
    //     ' '
    //   ).join('')}</a>`
    // );
    const replaceUsernamesInTextNodes = (html: string, userName: string, userId: string, displayName: string) => {
      const parser = new DOMParser();
      const doc = parser.parseFromString(html, 'text/html');
      const walk = (node: Node) => {
        if (node.nodeType === Node.TEXT_NODE) {
          const regex = new RegExp(`@${userName}`, 'g');
          const replacement = `<a href="/settings/view-profile/${userId}" class="text-danger" data-id="${userId}">@${displayName}</a>`;
          const replacedText = node.nodeValue?.replace(regex, replacement);
          if (replacedText !== node.nodeValue) {
            const span = document.createElement('span');
            span.innerHTML = replacedText!;
            while (span.firstChild) {
              node.parentNode?.insertBefore(span.firstChild, node);
            }
            node.parentNode?.removeChild(node);
          }
        } else if (node.nodeType === Node.ELEMENT_NODE && node.nodeName.toLowerCase() !== 'a') {
          node.childNodes.forEach(child => walk(child));
        }
      };
      doc.body.childNodes.forEach(child => walk(child));
      return doc.body.innerHTML;
    };
    const text = replaceUsernamesInTextNodes(htmlText, this.userNameSearch, user?.Id, user?.Username.split(' ').join(''));
    this.setTagInputDivValue(text);
    this.emitChangeEvent();
    this.moveCursorToEnd();
  }

  selectEmoji(emoji: any): void {
    let htmlText = this.tagInputDiv?.nativeElement?.innerHTML || '';
    const text = `${htmlText} <img src=${emoji} width="50" height="50">`;
    this.setTagInputDivValue(text);
    this.emitChangeEvent();
  }

  getUserList(search: string): void {
    if (this.isCustomeSearch) {
      this.messageService
        .getRoomProfileList(search, this.isCustomeSearch)
        .subscribe({
          next: (res: any) => {
            if (res?.data?.length > 0) {
              this.userList = res.data.map((e) => e);
            } else {
              this.clearUserSearchData();
            }
          },
          error: () => {
            this.clearUserSearchData();
          },
        });
    } else {
      this.customerService.getProfileList(search).subscribe({
        next: (res: any) => {
          if (res?.data?.length > 0) {
            this.userList = res.data.map((e) => e);
            // this.userSearchNgbDropdown.open();
          } else {
            this.clearUserSearchData();
          }
        },
        error: () => {
          this.clearUserSearchData();
        },
      });
    }
  }

  clearUserSearchData(): void {
    this.userNameSearch = '';
    this.userList = [];
    // this.userSearchNgbDropdown?.close();
  }

  clearMetaData(): void {
    this.metaData = {};
    this.emitChangeEvent();
  }

  setTagInputDivValue(htmlText: string): void {
    if (this.tagInputDiv) {
      this.renderer.setProperty(
        this.tagInputDiv.nativeElement,
        'innerHTML',
        htmlText
      );
    }
  }

  emitChangeEvent(): void {
    if (this.tagInputDiv) {
      const htmlText = this.tagInputDiv?.nativeElement?.innerHTML;
      this.value = `${htmlText}`.replace(
        /(?:<div><br><\/div>\s*)+/gi,
        '<div><br></div>'
      );
      this.onDataChange?.emit({
        html: this.value,
        tags: this.tagInputDiv?.nativeElement?.children,
        meta: this.metaData,
      });
    }
  }

  extractImageUrlFromContent(content: string): string | null {
    const contentContainer = document.createElement('div');
    contentContainer.innerHTML = content;
    const imgTag = contentContainer.querySelector('img');

    if (imgTag) {
      // const tagUserInput = document.querySelector('.tag-input-div') as HTMLInputElement;
      // if (tagUserInput) {tagUserInput.focus()}
      const imgTitle = imgTag.getAttribute('title');
      const imgStyle = imgTag.getAttribute('style');
      const imageGif = imgTag
        .getAttribute('src')
        .toLowerCase()
        .endsWith('.gif');
      if (!imgTitle && !imgStyle && !imageGif) {
        this.copyImage = imgTag.getAttribute('src');
      }
    }
    return null;
  }

  onClearFile() {
    this.copyImage = null;
  }
}
