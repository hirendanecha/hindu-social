import { Component, ViewChild } from '@angular/core';
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
  constructor(
    private modalService: NgbModal,
    public sharedService: SharedService,
    private router: Router,
    private customerService: CustomerService,
    public breakpointService: BreakpointService,
    private offcanvasService: NgbOffcanvas,
    public tokenService: TokenStorageService,
    private socketService: SocketService
  ) {
    this.originalFavicon = document.querySelector('link[rel="icon"]');
    this.socketService?.socket?.on('isReadNotification_ack', (data) => {
      if (data?.profileId) {
        this.sharedService.isNotify = false;
        localStorage.setItem('isRead', data?.isRead);
        this.originalFavicon.href = '/assets/images/default-profile.jpg';
      }
    });
    const isRead = localStorage.getItem('isRead');
    if (isRead === 'N') {
      this.sharedService.isNotify = true;
    } else {
      this.sharedService.isNotify = false;
    }
    this.channelId = +localStorage.getItem('channelId');

    this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        this.hideSubHeader = this.router.url.includes('profile-chats');
        this.hideOngoingCallButton = this.router.url.includes('facetime');
        console.log(this.hideSubHeader);
        this.sharedService.callId = sessionStorage.getItem('callId') || null;
        console.log(this.sharedService.callId);
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
}
