import {
  AfterViewInit,
  Component,
  EventEmitter,
  HostListener,
  Inject,
  OnDestroy,
  OnInit,
  Output,
  PLATFORM_ID,
} from '@angular/core';
import { SharedService } from './@shared/services/shared.service';
import { NgxSpinnerService } from 'ngx-spinner';
import { isPlatformBrowser } from '@angular/common';
import { SocketService } from './@shared/services/socket.service';
import { CustomerService } from './@shared/services/customer.service';
import { Howl } from 'howler';
import { IncomingcallModalComponent } from './@shared/modals/incoming-call-modal/incoming-call-modal.component';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ToastService } from './@shared/services/toast.service';
import { SoundControlService } from './@shared/services/sound-control.service';
import { Router } from '@angular/router';
import { TokenStorageService } from './@shared/services/token-storage.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit, AfterViewInit, OnDestroy {
  @Output('newRoomCreated') newRoomCreated: EventEmitter<any> =
    new EventEmitter<any>();
  title = 'Hindu-social';
  showButton = false;
  tab: any;

  profileId: number;
  notificationId: number;
  originalFavicon: HTMLLinkElement;
  currentURL = [];
  isOnCall = false;
  constructor(
    private sharedService: SharedService,
    private spinner: NgxSpinnerService,
    private socketService: SocketService,
    private customerService: CustomerService,
    private modalService: NgbModal,
    private toasterService: ToastService,
    private soundControlService: SoundControlService,
    private router: Router,
    private tokenService: TokenStorageService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    this.checkDocumentFocus();
    this.profileId = +localStorage.getItem('profileId');
    this.isOnCall = this.router.url.includes('/buzz-call/') || false;
  }

  ngOnInit(): void {
    this.socketService.socket?.emit('join', { room: this.profileId });

    if (this.tokenService.getToken()) {
      this.customerService.verifyToken(this.tokenService.getToken()).subscribe({
        next: (res: any) => {
          if (!res?.verifiedToken) {
            this.tokenService.signOut();
          }
        },
        error: (err) => {
          this.tokenService.signOut();
          // this.toasterService.warring(
          //   'your session is expire please login again!'
          // );
        },
      });
    }
  }

  ngAfterViewInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.originalFavicon = document.querySelector('link[rel="icon"]');
      this.sharedService.getUserDetails();
      this.spinner.hide();
      setTimeout(() => {
        const splashScreenLoader =
          document.getElementById('splashScreenLoader');
        if (splashScreenLoader) {
          splashScreenLoader.style.display = 'none';
        }
      }, 2000);

      if (!this.socketService.socket?.connected) {
        this.socketService.socket?.connect();
        this.socketService.socket?.emit('online-users');
      }

      this.socketService.socket?.on('notification', (data: any) => {
        if (data) {
          if (data?.notificationByProfileId !== this.profileId) {
            this.sharedService.isNotify = true;
            this.originalFavicon.href = '/assets/images/icon-unread.jpg';
          }
          this.notificationId = data.id;
          if (data?.actionType === 'T') {
            var sound = new Howl({
              src: [
                'https://s3.us-east-1.wasabisys.com/freedom-social/freedom-notification.mp3',
              ],
            });
            const notificationSoundOct = JSON.parse(
              localStorage.getItem('soundPreferences')
            )?.notificationSoundEnabled;
            if (notificationSoundOct !== 'N') {
              if (sound) {
                sound?.play();
              }
            }
          }
          if (
            data?.actionType === 'M' &&
            data?.notificationByProfileId !== this.profileId
          ) {
            this.newRoomCreated.emit(true);
            var sound = new Howl({
              src: [
                'https://s3.us-east-1.wasabisys.com/freedom-social/messageTone.mp3',
              ],
              volume: 0.5,
            });
            const messageSoundOct = JSON.parse(
              localStorage.getItem('soundPreferences')
            )?.messageSoundEnabled;
            if (messageSoundOct !== 'N') {
              if (sound) {
                sound?.play();
              }
            }
            this.toasterService.success(data?.notificationDesc);
            return this.sharedService.updateIsRoomCreated(true);
          }
          if (
            data?.actionType === 'VC' &&
            data?.notificationByProfileId !== this.profileId
          ) {
            var callSound = new Howl({
              src: [
                'https://s3.us-east-1.wasabisys.com/freedom-social/famous_ringtone.mp3',
              ],
              loop: true,
            });
            this.soundControlService.initTabId();
            const modalRef = this.modalService.open(
              IncomingcallModalComponent,
              {
                centered: true,
                size: 'sm',
                backdrop: 'static',
              }
            );
            modalRef.componentInstance.calldata = data;
            modalRef.componentInstance.sound = callSound;
            modalRef.result.then((res) => {
              return;
            });
          }
          if (
            data?.actionType === 'SC' &&
            data?.notificationByProfileId !== this.profileId
          ) {
            if (!this.currentURL.includes(data?.link)) {
              this.currentURL.push(data.link);
              this.modalService.dismissAll();
              const chatDataPass = {
                roomId: data.roomId || null,
                groupId: data.groupId || null,
              };
              if (!window.document.hidden) {
                const callIdMatch = data.link.match(/callId-\d+/);
                const callId = callIdMatch ? callIdMatch[0] : data.link;
                this.router.navigate([`/buzz-call/${callId}`], {
                  state: { chatDataPass },
                });
                // this.router.navigate([`/buzz-call/${data.link}`]);
              }
              // window.open(`appointment-call/${data.link}`, '_blank');
              // window?.open(data?.link, '_blank');
            }
          }
          if (this.notificationId) {
            this.customerService
              .getNotification(this.notificationId)
              .subscribe({
                next: (res) => {
                  localStorage.setItem('isRead', res.data[0]?.isRead);
                },
                error: (error) => {
                  console.log(error);
                },
              });
          }
        }
      });
      const isRead = localStorage.getItem('isRead');
      if (isRead === 'N') {
        this.sharedService.isNotify = true;
      }
    }
  }

  @HostListener('window:scroll', [])
  onWindowScroll() {
    if (window.scrollY > 300) {
      this.showButton = true;
    } else {
      this.showButton = false;
    }
  }

  scrollToTop() {
    window.scroll({
      top: 0,
      left: 0,
      behavior: 'smooth',
    });
  }

  @HostListener('document:visibilitychange', ['$event']) checkDocumentFocus() {
    if (!window.document.hidden) {
      if (this.tab) {
        clearInterval(this.tab);
      }
      if (!this.socketService.socket?.connected) {
        this.socketService.socket?.connect();
        const profileId = +localStorage.getItem('profileId');
        // this.socketService.socket?.emit('join', { room: profileId });
      }
    } else {
      this.tab = setInterval(() => {
        if (!this.socketService.socket?.connected) {
          this.socketService.socket?.connect();
          const profileId = +localStorage.getItem('profileId');
          // this.socketService.socket?.emit('join', { room: profileId });
        }
      }, 3000);
    }
  }
  ngOnDestroy(): void {
    this.currentURL = [];
  }
}
