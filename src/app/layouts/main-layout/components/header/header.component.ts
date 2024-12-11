import { AfterViewInit, Component, ViewChild } from '@angular/core';
import {
  NgbDropdown,
  NgbModal,
  NgbOffcanvas,
} from '@ng-bootstrap/ng-bootstrap';
import { SharedService } from '../../../../@shared/services/shared.service';
import { NavigationEnd, Router } from '@angular/router';
import { CustomerService } from '../../../../@shared/services/customer.service';
import { ProfileMenusModalComponent } from '../profile-menus-modal/profile-menus-modal.component';
import { NotificationsModalComponent } from '../notifications-modal/notifications-modal.component';
import { BreakpointService } from 'src/app/@shared/services/breakpoint.service';
import { RightSidebarComponent } from '../../components/right-sidebar/right-sidebar.component';
import { ResearchSidebarComponent } from '../../components/research-sidebar/research-sidebar.component';
import { LeftSidebarComponent } from '../../components/left-sidebar/left-sidebar.component';
import { environment } from 'src/environments/environment';
import { TokenStorageService } from 'src/app/@shared/services/token-storage.service';
import { SocketService } from 'src/app/@shared/services/socket.service';
import { UserGuideModalComponent } from 'src/app/@shared/modals/userguide-modal/userguide-modal.component';
import { IncomingcallModalComponent } from 'src/app/@shared/modals/incoming-call-modal/incoming-call-modal.component';
import { SoundControlService } from 'src/app/@shared/services/sound-control.service';
import { Howl } from 'howler';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
})
export class HeaderComponent {
  @ViewChild('userSearchDropdownRef', { static: false, read: NgbDropdown })
  userSearchNgbDropdown: NgbDropdown;
  isOpenUserMenu = false;
  userMenusOverlayDialog: any;
  userMenus = [];
  isBreakpointLessThenSmall = false;
  isDark = false;
  userList: any = [];
  searchText = '';

  channelId: number;

  showButton = false;
  sidebar: any = {
    isShowLeftSideBar: true,
    isShowRightSideBar: true,
    isShowResearchLeftSideBar: false,
  };
  environment = environment;
  originalFavicon: HTMLLinkElement;

  hideSearch = false;
  hideSubHeader: boolean = false;
  hideOngoingCallButton: boolean = false;
  authToken = localStorage.getItem('auth-token');
  showUserGuideBtn: boolean = false;
  private subscription: Subscription;
  constructor(
    private modalService: NgbModal,
    public sharedService: SharedService,
    private router: Router,
    private customerService: CustomerService,
    public breakpointService: BreakpointService,
    private offcanvasService: NgbOffcanvas,
    public tokenService: TokenStorageService,
    private socketService: SocketService,
    private soundControlService: SoundControlService
  ) {
    this.originalFavicon = document.querySelector('link[rel="icon"]');
    this.subscription = this.sharedService.isNotify$.subscribe(
      (value) => (this.sharedService.isNotify = value)
    );
    this.socketService?.socket?.on('isReadNotification_ack', (data) => {
      if (data?.profileId) {
        // this.sharedService.isNotify = false;
        this.sharedService.setNotify(false);
        localStorage.setItem('isRead', data?.isRead);
        this.originalFavicon.href = '/assets/images/default-profile.jpg';
      }
    });
    const isRead = localStorage.getItem('isRead');
    if (isRead === 'N') {
      // this.sharedService.isNotify = true;
      this.sharedService.setNotify(true);
    } else {
      // this.sharedService.isNotify = false;
      this.sharedService.setNotify(false);
    }
    this.channelId = +localStorage.getItem('channelId');

    this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        const currentUrl = this.router.url;
        const profileId = +localStorage.getItem('profileId') || null;

        this.hideSubHeader =
          currentUrl.includes('profile-chats') ||
          currentUrl.includes('facetime');
        this.showUserGuideBtn = currentUrl.includes('home');
        this.hideOngoingCallButton = currentUrl.includes('facetime');
        this.sharedService.callId = localStorage.getItem('callId') || null;

        if (!profileId) return;

        const reqObj = { profileId };
        this.socketService?.checkCall(reqObj, (data: any) => {
          const isOnCall = data?.isOnCall === 'Y';
          const hasCallLink = data?.callLink;

          if (isOnCall && hasCallLink && !this.sharedService.callId) {
            if (!this.hideOngoingCallButton) {
              const callSound = new Howl({
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

              const callData = {
                Username: '',
                link: data.callLink,
                roomId: data.roomId,
                groupId: data.groupId,
                ProfilePicName: this.sharedService?.userData?.ProfilePicName,
              };

              modalRef.componentInstance.calldata = callData;
              modalRef.componentInstance.sound = callSound;
              modalRef.componentInstance.showCloseButton = true;
              modalRef.componentInstance.title = 'Join existing call...';

              modalRef.result.then((res) => {
                if (res === 'cancel') {
                  const callLogData = {
                    profileId,
                    roomId: callData?.roomId,
                    groupId: callData?.groupId,
                  };
                  this.socketService?.endCall(callLogData);
                }
              });
            }
          } else {
            this.hideOngoingCallButton = true;
          }
        });
      }
    });
  }

  openProfileMenuModal(): void {
    this.userMenusOverlayDialog = this.modalService.open(
      ProfileMenusModalComponent,
      {
        keyboard: true,
        modalDialogClass: 'profile-menus-modal',
      }
    );
  }

  openNotificationsModal(): void {
    this.userMenusOverlayDialog = this.modalService.open(
      NotificationsModalComponent,
      {
        keyboard: true,
        modalDialogClass: 'notifications-modal',
      }
    );
  }

  openProfileMobileMenuModal(): void {
    if (this.tokenService.getCredentials()) {
      this.offcanvasService.open(ProfileMenusModalComponent, {
        position: 'start',
        panelClass: 'w-300-px',
      });
    } else {
      this.openRightSidebar();
    }
  }

  openNotificationsMobileModal(): void {
    this.offcanvasService.open(NotificationsModalComponent, {
      position: 'end',
      panelClass: 'w-300-px',
    });
  }

  getUserList(): void {
    this.customerService.getProfileList(this.searchText).subscribe({
      next: (res: any) => {
        if (res?.data?.length > 0) {
          this.userList = res.data;
          this.userSearchNgbDropdown.open();
        } else {
          this.userList = [];
          this.userSearchNgbDropdown.close();
        }
      },
      error: () => {
        this.userList = [];
        this.userSearchNgbDropdown.close();
      },
    });
  }

  openProfile(id) {
    if (id) {
      this.router.navigate([`settings/view-profile/${id}`]);
      this.searchText = '';
    }
  }

  openLeftSidebar() {
    this.offcanvasService.open(
      this.sidebar?.isShowResearchLeftSideBar
        ? ResearchSidebarComponent
        : LeftSidebarComponent,
      { position: 'start', panelClass: 'w-300-px' }
    );
  }

  openRightSidebar() {
    this.offcanvasService.open(RightSidebarComponent, {
      position: 'end',
      panelClass: 'w-300-px',
    });
  }

  scrollToTop() {
    window.scroll({
      top: 0,
      left: 0,
      behavior: 'smooth',
    });
    this.router.navigate(['home']);
  }

  reloadPage(): void {
    this.router.navigate(['home']).then(() => {
      location.reload();
    });
  }

  redirectToTube(): void {
    const channelId = +localStorage.getItem('channelId');
    // if (channelId) {
    //   window.open(`${environment.tubeUrl}?channelId=${channelId}`, '_blank');
    // } else {
    //   window.open(`${environment.tubeUrl}`, '_blank');
    // }
    let redirectUrl = `${environment.tubeUrl}`;
    if (channelId) {
      redirectUrl += `?channelId=${channelId}`;
    }
    if (this.authToken) {
      redirectUrl += channelId
        ? `&authToken=${this.authToken}`
        : `?authToken=${this.authToken}`;
    }
    window.open(redirectUrl, '_blank');
  }

  openUserGuide() {
    this.modalService.open(UserGuideModalComponent, {
      centered: true,
      size: 'lg',
    });
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }
}
