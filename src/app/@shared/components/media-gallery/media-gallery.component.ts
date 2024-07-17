import { Component, Input, OnInit } from '@angular/core';
import { MessageService } from '../../services/message.service';
import * as moment from 'moment';
import { NgbActiveOffcanvas, NgbModal } from '@ng-bootstrap/ng-bootstrap';
// import { GalleryImgPreviewComponent } from '../gallery-img-preview/gallery-img-preview.component';
import { ToastService } from '../../services/toast.service';
import { FILE_EXTENSIONS, FILE_EXTENSIONS_Video } from '../../constant/file-extensions';
import { GalleryImgPreviewComponent } from '../gallery-img-preview/gallery-img-preview.component';

@Component({
  selector: 'app-media-gallery',
  templateUrl: './media-gallery.component.html',
  styleUrls: ['./media-gallery.component.scss'],
})
export class MediaGalleryComponent implements OnInit {
  @Input('userChat') userChat: any = {};
  mediaList: any = [];
  fileName: string;
  profileId: number;
  activePage = 1;
  hasMoreData = true;
  isFileLoad = false;

  constructor(
    private messageService: MessageService,
    public activeOffCanvas: NgbActiveOffcanvas,
    private modalService: NgbModal,
    private toastService: ToastService
  ) {
    this.profileId = +localStorage.getItem('profileId');
  }

  ngOnInit() {
    this.getMessageMedia();
  }

  loadMoreMedia() {
    this.activePage = this.activePage + 1;
    this.getMessageMedia();
  }

  getMessageMedia(): void {
    this.isFileLoad = true;
    const data = {
      page: this.activePage,
      size: 10,
      roomId: this.userChat?.roomId || null,
      groupId: this.userChat?.groupId || null,
    };
    this.messageService.getMessageMedia(data).subscribe({
      next: (res) => {
        this.isFileLoad = false;
        if (this.activePage < res?.pagination.totalPages) {
          this.hasMoreData = true;
        } else {
          this.hasMoreData = false;
        }
        let groupedMediaList = [];
        res.data.forEach((ele) => {
          const messageDate = new Date(ele?.createdDate);
          const today = new Date();
          const yesterday = new Date(today);
          yesterday.setDate(today.getDate() - 1);
          let groupHeader = '';
          if (messageDate.toDateString() === today.toDateString()) {
            groupHeader = 'Today';
          } else if (messageDate.toDateString() === yesterday.toDateString()) {
            groupHeader = 'Yesterday';
          } else {
            groupHeader = moment.utc(messageDate).local().format('DD-MMM-YYYY');
          }
          const existingGroupIndex = groupedMediaList.findIndex(
            (group) => group.date === groupHeader
          );

          if (existingGroupIndex === -1) {
            groupedMediaList.push({ date: groupHeader, messages: [ele] });
          } else {
            groupedMediaList[existingGroupIndex].messages.push(ele);
          }
        });
        this.mediaList = [...this.mediaList, ...groupedMediaList];
      },
      error: (error) => {
        console.log(error);
        this.isFileLoad = false;
      },
    });
  }

  isFile(media: string): boolean {
    this.fileName = media?.split('/')[3]?.replaceAll('%', '-');
    const File = FILE_EXTENSIONS;
    return File.some((ext) => media?.endsWith(ext));
  }
  
  isVideoFile(media: string): boolean {
    const FILE_EXTENSIONS = FILE_EXTENSIONS_Video;
    return FILE_EXTENSIONS.some((ext) => media?.endsWith(ext));
  }

  isGif(src: string): boolean {
    return !src?.toLowerCase()?.endsWith('.gif');
  }

  pdfView(pdfUrl: string) {
    window.open(pdfUrl);
    this.toastService.success('Download successfully initiated.');
  }

  downloadPdf(data): void {
    const pdfLink = document.createElement('a');
    pdfLink.href = data;
    pdfLink.click();
    this.toastService.success('Download successfully initiated.');
  }

  openImagePreview(src: string) {
    const modalRef = this.modalService.open(GalleryImgPreviewComponent, {
      backdrop: 'static',
    });
    modalRef.componentInstance.src = src;
    modalRef.componentInstance.roomId = this.userChat?.roomId;
    modalRef.componentInstance.groupId = this.userChat?.groupId;
    modalRef.componentInstance.activePage = this.activePage;
  }
}
