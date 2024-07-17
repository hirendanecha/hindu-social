import {
  Component,
  ElementRef,
  NgZone,
  OnDestroy,
  OnInit,
  Renderer2,
} from '@angular/core';
import { NgbModal, NgbOffcanvas } from '@ng-bootstrap/ng-bootstrap';
import { ProfileChatsSidebarComponent } from './profile-chats-sidebar/profile-chats-sidebar.component';
import { SharedService } from 'src/app/@shared/services/shared.service';
import { SocketService } from 'src/app/@shared/services/socket.service';
import { ConfirmationModalComponent } from 'src/app/@shared/modals/confirmation-modal/confirmation-modal.component';
import { BreakpointService } from 'src/app/@shared/services/breakpoint.service';
import { take } from 'rxjs';
import * as moment from 'moment';
import { AppQrModalComponent } from 'src/app/@shared/modals/app-qr-modal/app-qr-modal.component';
import { ConferenceLinkComponent } from 'src/app/@shared/modals/create-conference-link/conference-link-modal.component';
import { Router } from '@angular/router';

@Component({
  selector: 'app-profile-chat-list',
  templateUrl: './profile-chats.component.html',
  styleUrls: ['./profile-chats.component.scss'],
})
export class ProfileChartsComponent implements OnInit, OnDestroy {
  activeIdTab: string = 'local';
  pageList = [];
  profileId: number;
  selectedRoomId: number;
  isPageLoader: boolean = false;
  isRoomCreated: boolean = false;

  mobileMenuToggle: boolean = false;

  userChat: any = {};
  messageList: any = [];

  sidebar: any = {
    isShowLeftSideBar: true,
    isShowRightSideBar: true,
    isShowResearchLeftSideBar: false,
    isShowChatListSideBar: true,
  };
  oldChat: any = {};

  isMessageSoundEnabled: boolean = true;
  isCallSoundEnabled: boolean = true;
  isInnerWidthSmall: boolean;
  isSidebarOpen: boolean = false;

  constructor(
    private renderer: Renderer2,
    private el: ElementRef,
    private offcanvasService: NgbOffcanvas,
    private sharedService: SharedService,
    private socketService: SocketService,
    private modalService: NgbModal,
    public breakpointService: BreakpointService,
    private ngZone:NgZone,
    private router: Router,
  ) {
    this.profileId = +localStorage.getItem('profileId');
    if (this.sharedService.isNotify) {
      this.sharedService.isNotify = false;
    }
  }
  ngOnInit(): void {
    this.socketService.connect();

    const isMobilePopUp = localStorage.getItem('isMobilePopShow');
    if (isMobilePopUp !== 'N') {
      this.breakpointService.screen.pipe(take(1)).subscribe((screen) => {
        if (screen?.md?.lessThen) {
          this.mobileShortCutPopup();
        }
      });
    }

    this.isInnerWidthSmall = window.innerWidth < 576;
    if (this.isInnerWidthSmall && !this.isSidebarOpen && this.router.url === '/profile-chats') {
      this.openChatListSidebar();
    }
    this.ngZone.runOutsideAngular(() => {
      window.addEventListener('resize', this.onResize.bind(this));
    });
  }

  mobileMenu(): void {
    this.mobileMenuToggle = !this.mobileMenuToggle;
    this.renderer.setStyle(
      this.el.nativeElement.ownerDocument.body,
      'overflow',
      'hidden'
    );
  }

  onChatPost(userName: any) {
    // console.log('old-user-chat', this.userChat);
    if (this.userChat?.groupId) {
      const date = moment(new Date()).utc();
      this.oldChat = {
        profileId: this.profileId,
        groupId: this.userChat.groupId,
        date: moment(date).format('YYYY-MM-DD HH:mm:ss'),
      };
      this.socketService.switchChat(this.oldChat, (data) => {
        console.log(data);
      });
    }

    this.userChat = userName;
    // console.log('new-user-chat', this.userChat);
  }

  onNewChatRoom(isRoomCreated) {
    this.isRoomCreated = isRoomCreated;
    return this.sharedService.updateIsRoomCreated(this.isRoomCreated);
  }

  onSelectChat(id) {
    this.selectedRoomId = id;
  }

  onResize() {
    this.ngZone.run(() => {
      this.isInnerWidthSmall = window.innerWidth < 576;
      // if (this.isInnerWidthSmall && !this.isSidebarOpen && this.router.url === '/profile-chats') {
      //   this.openChatListSidebar();
      // }
    });
  }

  openChatListSidebar() {
    this.isSidebarOpen = true;
    const offcanvasRef = this.offcanvasService.open(
      ProfileChatsSidebarComponent,
      this.userChat
    );
    offcanvasRef.componentInstance.onNewChat.subscribe((emittedData: any) => {
      this.onChatPost(emittedData);
    });
    offcanvasRef.result.then((result) => {}).catch((reason) => {
      this.isSidebarOpen = false;
    });
  }

  mobileShortCutPopup() {
    const modalRef = this.modalService.open(ConfirmationModalComponent, {
      centered: true,
    });
    modalRef.componentInstance.title = 'Mobile screen detected';
    modalRef.componentInstance.confirmButtonLabel = 'Yes';
    modalRef.componentInstance.cancelButtonLabel = 'No';
    modalRef.componentInstance.message =
      'Would you like to add a hindu.social icon to your mobile Home screen?';
    modalRef.result.then((res) => {
      localStorage.setItem('isMobilePopShow', 'N');
      if (res === 'success') {
        const modalRef = this.modalService.open(ConfirmationModalComponent, {
          centered: true,
        });
        modalRef.componentInstance.title = 'Add hindu chats on home';
        modalRef.componentInstance.confirmButtonLabel = 'Do not display again';
        modalRef.componentInstance.cancelButtonLabel = 'Close';
        modalRef.componentInstance.message =
          'On your browser click on browser menu, then click Add to Home Screen';
        modalRef.result.then((res) => {
          if (res === 'success') {
            // localStorage.setItem('isMobilePopShow', 'N');
          }
        });
      }
    });
  }

  toggleSoundPreference(property: string, ngModelValue: boolean): void {
    const soundPreferences =
      JSON.parse(localStorage.getItem('soundPreferences')) || {};
    soundPreferences[property] = ngModelValue ? 'Y' : 'N';
    localStorage.setItem('soundPreferences', JSON.stringify(soundPreferences));
  }

  appQrmodal(){
    const modalRef = this.modalService.open(AppQrModalComponent, {
      centered: true,
    });
  }
  uniqueLink(){
    const modalRef = this.modalService.open(ConferenceLinkComponent ,{
      centered: true,
    });
  }

  ngOnDestroy(): void {
    this.isRoomCreated = false;
    window.removeEventListener('resize', this.onResize.bind(this));
    // if (this.socketService?.socket) {
    //   this.socketService.socket?.disconnect();
    // }
  }
}
