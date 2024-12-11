import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  ElementRef,
  Input,
  Renderer2,
  ViewChild,
} from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { ToastService } from '../../services/toast.service';
import { getTagUsersFromAnchorTags } from '../../utils/utils';

@Component({
  selector: 'app-edit-post-modal',
  templateUrl: './edit-post-modal.component.html',
  styleUrls: ['./edit-post-modal.component.scss'],
})
export class EditPostModalComponent implements AfterViewInit {
  @Input() cancelButtonLabel: string = 'Cancel';
  @Input() confirmButtonLabel: string = 'Confirm';
  @Input() title: string = 'Confirmation Dialog';
  @Input() message: string;
  @Input() data: any;
  @ViewChild('parentPostCommentElement', { static: false })
  parentPostCommentElement: ElementRef;

  postData: any = {
    file: null,
    url: '',
    tags: [],
  };

  postInputValue: string = '';
  commentMessageTags: any[];
  selectedImage = '';

  postMediaData: any[] = [];
  selectedFiles: any[] = [];
  editMediaData: any[] = [];
  removeImagesList: any[] = [];

  constructor(
    public activeModal: NgbActiveModal,
    private toastService: ToastService,
    private renderer: Renderer2,
    private changeDetectorRef: ChangeDetectorRef
  ) {}

  ngAfterViewInit(): void {
    if (this.data) {
      this.postInputValue = this.data?.postdescription;
      // this.pdfName = this.data?.pdfUrl?.split('/')[3];
      this.postData = { ...this.data };
      this.changeDetectorRef.detectChanges();
      // let media = this.postData?.imagesList;
      this.postMediaData = this.postData?.imagesList.length
        ? this.postData.imagesList
        : this.postData.pdfUrl
        ? [{ pdfUrl: this.postData.pdfUrl }]
        : [];
    }
  }

  // onPostFileSelect(event: any): void {
  //   const file = event.target?.files?.[0] || {};
  //   if (file.type.includes('image/')) {
  //     this.postData['file'] = file;
  //     this.selectedImage = URL.createObjectURL(file);
  //   } else if (file.type.includes('application/pdf')) {
  //     this.postData['file'] = file;
  //     this.pdfName = file?.name;
  //   }
  //   else {
  //     this.toastService.danger(`sorry ${file.type} are not allowed!`)
  //   }
  //   // if (file?.size < 5120000) {
  //   // } else {
  //   //   this.toastService.warring('Image is too large!');
  //   // }
  // }

  onPostFileSelect(event: any): void {
    const files = event.target?.files;
    if (this.combinedMediaData.length > 3) {
      this.toastService.warring(
        'Please choose up to 4 photos, videos, or GIFs.'
      );
      return;
    }
    if (files.length > 4) {
      this.toastService.warring(
        'Please choose up to 4 photos, videos, or GIFs.'
      );
      return;
    }
    let existingFileType = '';
    if (this.combinedMediaData.length > 0) {
      existingFileType = this.combinedMediaData[0]?.file?.type.split('/')[0];
    }
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const fileData: any = {
        file: file,
        pdfName: null,
        imageUrl: null,
      };
      const fileType = file.type.split('/')[0];
      if (existingFileType && fileType !== existingFileType) {
        this.toastService.warring(
          'Please select only one type of file at a time.'
        );
        return;
      }
      if (
        file.type.includes('application/pdf') ||
        file.type.includes('application/msword') ||
        file.type.includes(
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
        )
      ) {
        fileData.pdfName = file.name;
      } else if (file.type.includes('image/')) {
        fileData.imageUrl = URL.createObjectURL(file);
      }
      this.selectedFiles.push(fileData);
    }
    this.editMediaData = (this.editMediaData || []).concat(this.selectedFiles);
  }

  removePostSelectedFile(media: any = {}, type: string): void {
    if (type === 'pdf') {
      this.postData.pdfUrl = '';
      this.postMediaData = [];
      this.editMediaData = [];
      this.selectedFiles = [];
      return;
    } else {
      if (media.id) {
        this.removeImagesList.push({ id: media.id });
        this.postMediaData = this.postMediaData.filter(
          (ele) => ele.id != media.id
        );
      } else {
        this.editMediaData = this.editMediaData.filter(
          (ele: any) => ele?.file?.name != media?.file?.name
        );
      }
    }
  }

  // removePostSelectedFile(): void {
  //   this.postData['file'] = null;
  //   this.postData['imageUrl'] = '';
  //   this.postData['pdfUrl'] = '';
  //   this.selectedImage = '';
  //   this.pdfName = '';
  // }

  onChangeComment(): void {
    this.postData.tags = getTagUsersFromAnchorTags(this.commentMessageTags);
    this.postData['editImagesList'] = this.editMediaData;
    this.postData['imagesList'] = this.postMediaData;
    this.postData['removeImagesList'] = this.removeImagesList;
    this.activeModal.close(this.postData);
  }

  onTagUserInputChangeEvent(data: any): void {
    this.extractLargeImageFromContent(data.html);
    this.commentMessageTags = data?.tags;
  }

  extractLargeImageFromContent(content: string): void {
    const contentContainer = document.createElement('div');
    contentContainer.innerHTML = content;
    const imgTag = contentContainer.querySelector('img');

    if (imgTag) {
      const imgTitle = imgTag.getAttribute('title');
      const imgStyle = imgTag.getAttribute('style');
      const imageGif = imgTag
        .getAttribute('src')
        .toLowerCase()
        .endsWith('.gif');
      if (!imgTitle && !imgStyle && !imageGif) {
        const copyImage = imgTag.getAttribute('src');
        // const bytes = copyImage.length;
        // const megabytes = bytes / (1024 * 1024);
        // if (megabytes > 1) {
          // this.postData.comment = content.replace(copyImage, '');
          let copyImageTag = '<img\\s*src\\s*=\\s*""\\s*alt\\s*="">';
          this.postData.postdescription = `<div>${content
            .replace(copyImage, '')
            .replace(/\<br\>/gi, '')
            .replace(new RegExp(copyImageTag, 'g'), '')}</div>`;
          const base64Image = copyImage
            .trim()
            .replace(/^data:image\/\w+;base64,/, '');
          try {
            const binaryString = window.atob(base64Image);
            const uint8Array = new Uint8Array(binaryString.length);
            for (let i = 0; i < binaryString.length; i++) {
              uint8Array[i] = binaryString.charCodeAt(i);
            }
            const blob = new Blob([uint8Array], { type: 'image/jpeg' });
            const fileName = `copyImage-${new Date().getTime()}.jpg`;
            const file = new File([blob], fileName, { type: 'image/jpeg' });
            this.postData['file'] = file;
          } catch (error) {
            console.error('Base64 decoding error:', error);
          }
        // } else {
        //   this.postData.postdescription = content;
        // }
      } else {
        this.postData.postdescription = content;
      }
    } else {
      this.postData.postdescription = content;
    }
  }

  get combinedMediaData(): any[] {
    return [...(this.editMediaData || []), ...(this.postMediaData || [])];
  }
}
