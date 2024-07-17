import { Component, ElementRef, Input, NgZone, ViewChild } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { ToastService } from '../../services/toast.service';
import { environment } from 'src/environments/environment';
import { FixMeLater } from 'angularx-qrcode/public-api';

@Component({
  selector: 'app-app-qr-modal',
  templateUrl: './app-qr-modal.component.html',
  styleUrls: ['./app-qr-modal.component.scss'],
})
export class AppQrModalComponent {
  @Input() store: string;
  @Input() image: string;
  @Input() title: string | undefined = 'BuzzRing App';
  @ViewChild('qrCode', { static: false }) qrCodeElement: ElementRef;
  showPlayQr: boolean = false;
  showStoreQr: boolean = false;
  isInnerWidthSmall: boolean;
  playStore = 'https://play.google.com/store/apps/details?id=com.buzzring.app';
  appStore = 'https://apps.apple.com/au/app/buzz-ring/id6503036047';
  qrLink = '';

  constructor(
    public activeModal: NgbActiveModal,
    private toastService: ToastService,
    private ngZone: NgZone
  ) {
    const profileId = +localStorage.getItem('profileId');
    const authToken = localStorage.getItem('auth-token');
    this.qrLink = `${environment.qrLink}${profileId}?token=${authToken}`;
    this.isInnerWidthSmall = window.innerWidth < 768;
    this.ngZone.runOutsideAngular(() => {
      window.addEventListener('resize', this.onResize.bind(this));
    });
  }

  onResize() {
    this.ngZone.run(() => {
      this.isInnerWidthSmall = window.innerWidth < 768;
    });
  }

  togglePlayApp() {
    this.showPlayQr = !this.showPlayQr;
  }

  toggleStoreApp() {
    this.showStoreQr = !this.showStoreQr;
  }

  handleClick(store: string): void {
    if (this.isInnerWidthSmall) {
      this.downloadApp(store);
    } else {
      store === 'playStore' ? this.togglePlayApp() : this.toggleStoreApp();
    }
  }

  downloadApp(store: string): void {
    const appLink = document.createElement('a');
    appLink.href = store === 'playStore' ? this.playStore : this.appStore;
    appLink.click();
    this.toastService.success('Download successfully initiated.');
  }

  closePreview() {
    this.showPlayQr = false;
    this.showStoreQr = false;
  }

  saveAsImage(parent: FixMeLater) {
    let parentElement = null;

    // if (this.elementType === 'canvas') {
    //   // fetches base 64 data from canvas
    //   parentElement = parent.qrcElement.nativeElement
    //     .querySelector('canvas')
    //     .toDataURL('image/png');
    // } else if (this.elementType === 'img' || this.elementType === 'url') {
    //   // fetches base 64 data from image
    //   // parentElement contains the base64 encoded image src
    //   // you might use to store somewhere
    // } else {
    //   alert("Set elementType to 'canvas', 'img' or 'url'.");
    // }
    parentElement = parent.qrcElement.nativeElement.querySelector('img').src;

    if (parentElement) {
      let blobData = this.convertBase64ToBlob(parentElement);
      const blob = new Blob([blobData], { type: 'QRCode' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'BuzzRing_Auth.png';
      link.click();
    }
  }

  private convertBase64ToBlob(Base64Image: string) {
    const parts = Base64Image.split(';base64,');
    const imageType = parts[0].split(':')[1];
    const decodedData = window.atob(parts[1]);
    const uInt8Array = new Uint8Array(decodedData.length);
    for (let i = 0; i < decodedData.length; ++i) {
      uInt8Array[i] = decodedData.charCodeAt(i);
    }
    return new Blob([uInt8Array], { type: imageType });
  }
}
