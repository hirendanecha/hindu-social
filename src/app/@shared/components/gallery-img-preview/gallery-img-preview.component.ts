import { Component, ElementRef, Input, OnInit, Renderer2 } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { MessageService } from '../../services/message.service';
import { FILE_EXTENSIONS, FILE_EXTENSIONS_Video } from '../../constant/file-extensions';

@Component({
  selector: 'app-gallery-img-preview',
  templateUrl: './gallery-img-preview.component.html',
  styleUrls: ['./gallery-img-preview.component.scss'],
})
export class GalleryImgPreviewComponent implements OnInit {
  @Input('src') src: string;
  @Input('roomId') roomId: number;
  @Input('groupId') groupId: number;
  @Input('activePage') activePage: number;

  previewSrc: string = '';
  mediaList = [];
  hasMoreData = false;
  currentIndex: number;
  currentPage: number;

  pagination: any = {};

  constructor(
    private renderer: Renderer2,
    private el: ElementRef,
    private activateModal: NgbActiveModal,
    private messageService: MessageService
  ) {
    // this.subscribeToEscapeKey();
  }
  ngOnInit(): void {
    this.previewSrc = this.src;
    this.currentPage = this.activePage;
    const data = {
      size: 10 * this.activePage,
      roomId: this.roomId || null,
      groupId: this.groupId || null,
    };
    this.getMessageMedia(data);
  }

  openImagePreview(src: string) {
    this.renderer.setStyle(
      this.el.nativeElement.ownerDocument.body,
      'overflow',
      'hidden'
    );
  }

  getMessageMedia(data): void {
    this.messageService.getMessageMedia(data).subscribe({
      next: (res) => {
        this.pagination = res.pagination;
        this.mediaList = [...this.mediaList, ...res.data];
        if (this.currentPage === this.activePage) {
          this.currentIndex = this.mediaList?.findIndex((ele) => {
            return ele.messageMedia === this.src;
          });
        } else {
          this.currentIndex++;
          this.hasMoreData = true;
        }
        if (this.currentIndex < res?.pagination.totalItems) {
          this.hasMoreData = true;
        } else {
          this.hasMoreData = false;
        }
        // console.log(this.mediaList, this.currentIndex);
      },
      error: (error) => {
        console.log(error);
      },
    });
  }

  stopPropagation(event: Event) {
    event.stopPropagation();
  }

  closeImagePreview() {
    this.previewSrc = '';
    this.renderer.removeStyle(
      this.el.nativeElement.ownerDocument.body,
      'overflow'
    );
    this.activateModal.close();
  }

  subscribeToEscapeKey(): void {
    document.addEventListener('keydown', (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        this.closeImagePreview();
      }
    });
  }

  isFile(media: string): boolean {
    const File = FILE_EXTENSIONS;
    return File.some((ext) => media?.endsWith(ext));
  }

  isVideoFile(media: string): boolean {
    const FILE_EXTENSIONS = FILE_EXTENSIONS_Video;
    return FILE_EXTENSIONS.some((ext) => media?.endsWith(ext));
  }

  prev() {
    if (this.currentIndex > 0) {
      this.currentIndex--;
      this.hasMoreData = true;
    }
  }

  next() {
    if (this.currentIndex < this.mediaList.length - 1) {
      this.currentIndex++;
    } else if (this.activePage !== this.pagination.totalPages) {
      this.activePage = this.activePage + 1;
      const data = {
        page: this.activePage,
        size: 10,
        roomId: this.roomId || null,
        groupId: this.groupId || null,
      };
      this.getMessageMedia(data);
    } else {
      this.hasMoreData = false;
    }
  }
}
