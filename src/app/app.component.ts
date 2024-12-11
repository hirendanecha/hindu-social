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
  tagNotificationSound: boolean;
  messageNotificationSound: boolean;
  soundEnabled: boolean;
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
          if (data.actionType === 'S') {
            this.toasterService.danger(data?.notificationDesc);
            this.logout();
          }
          if (
            data.actionType === 'EC' &&
            data.notificationByProfileId !== this.profileId &&
            localStorage.getItem('callId')
          ) {
            this.sharedService.callId = null;
            localStorage.removeItem('callId');
            const endCall = {
              profileId: this.profileId,
              roomId: data.roomId,
            };
            this.socketService?.endCall(endCall);
            this.router.navigate(['/profile-chats']);
          }
          // const userData = this.tokenService.getUser();
          // this.sharedService.getLoginUserDetails(userData);
          this.sharedService.loginUserInfo.subscribe((user) => {
            this.tagNotificationSound =
              user.tagNotificationSound === 'Y' || false;
            this.messageNotificationSound =
              user.messageNotificationSound === 'Y' || false;
          });
          if (data?.notificationByProfileId !== this.profileId && !data.status) {
            this.sharedService.setNotify(true);
            // this.sharedService.isNotify = true;
            this.originalFavicon.href = '/assets/images/icon-unread.jpg';
          }
          this.soundControlService.soundEnabled$.subscribe((soundEnabled) => {
            this.soundEnabled = soundEnabled;
          });
          this.notificationId = data.id;
          if (data?.actionType === 'T') {
            // const notificationSoundOct = JSON.parse(
            //   localStorage.getItem('soundPreferences')
            // )?.notificationSoundEnabled;
            if (this.tagNotificationSound && this.soundEnabled) {
              const url =
                'https://s3.us-east-1.wasabisys.com/freedom-social/freedom-notification.mp3';
              this.soundIntegration(url);
            }
          }
          if (
            data?.actionType === 'M' &&
            data?.notificationByProfileId !== this.profileId
          ) {
            this.newRoomCreated.emit(true);
            // const messageSoundOct = JSON.parse(
            //   localStorage.getItem('soundPreferences')
            // )?.messageSoundEnabled;
            // if (messageSoundOct !== 'N') {
            //   if (sound) {
            //     sound?.play();
            //   }
            // }
            if (this.messageNotificationSound && this.soundEnabled) {
              const url =
                'https://s3.us-east-1.wasabisys.com/freedom-social/messageTone.mp3';
              this.soundIntegration(url);
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
            this.sharedService.setNotify(false);
            if (!this.currentURL.includes(data?.link)) {
              this.currentURL.push(data.link);
              this.modalService.dismissAll();
              const chatDataPass = {
                roomId: data.roomId || null,
                groupId: data.groupId || null,
              };
              if (
                !window.document.hidden &&
                this.sharedService.isCorrectBrowserSession()
              ) {
                const callIdMatch = data.link.match(/callId-\d+/);
                const callId = callIdMatch ? callIdMatch[0] : data.link;
                this.router.navigate([`/facetime/${callId}`], {
                  state: { chatDataPass },
                });
                // this.router.navigate([`/facetime/${data.link}`]);
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
        // this.sharedService.isNotify = true;
        this.sharedService.setNotify(true);
        this.originalFavicon.href = '/assets/images/icon-unread.jpg';
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

  soundIntegration(soundUrl: string): void {
    var sound = new Howl({
      src: [soundUrl],
      volume: 0.5,
    });
    if (sound) {
      sound?.play();
    }
  }

  logout(): void {
    // this.isCollapsed = true;
    this.socketService?.socket?.emit('offline', (data) => {
      return;
    });
    this.socketService?.socket?.on('get-users', (data) => {
      data.map((ele) => {
        if (!this.sharedService.onlineUserList.includes(ele.userId)) {
          this.sharedService.onlineUserList.push(ele.userId);
        }
      });
      // this.onlineUserList = data;
    });
    this.customerService.logout().subscribe({
      next: (res) => {
        this.tokenService.clearLoginSession(this.profileId);
        this.tokenService.signOut();
        return;
      },
      error: (err) => {
        if (err.status === 401) {
          this.tokenService.signOut();
        }
      },
    });
    // this.toastService.success('Logout successfully');
    // this.router.navigate(['/auth']);
    // this.isDomain = false;
  }

  ngOnDestroy(): void {
    this.currentURL = [];
  }
}
