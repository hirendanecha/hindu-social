import {
  AfterViewInit,
  Component,
  EventEmitter,
  Input,
  OnChanges,
  OnInit,
  Output,
  SimpleChanges,
  ViewChild,
} from '@angular/core';
import { CustomerService } from 'src/app/@shared/services/customer.service';
import {
  NgbActiveOffcanvas,
  NgbDropdown,
  NgbModal,
  NgbOffcanvas,
} from '@ng-bootstrap/ng-bootstrap';
import { SocketService } from 'src/app/@shared/services/socket.service';
import { SharedService } from 'src/app/@shared/services/shared.service';
import { ActivatedRoute, Router } from '@angular/router';
import * as moment from 'moment';
import { ToastService } from 'src/app/@shared/services/toast.service';
import { ConferenceLinkComponent } from 'src/app/@shared/modals/create-conference-link/conference-link-modal.component';
import { MessageService } from 'src/app/@shared/services/message.service';
import { EncryptDecryptService } from 'src/app/@shared/services/encrypt-decrypt.service';
import { CreateGroupModalComponent } from 'src/app/@shared/modals/create-group-modal/create-group-modal.component';
import { AppQrModalComponent } from 'src/app/@shared/modals/app-qr-modal/app-qr-modal.component';

@Component({
  selector: 'app-profile-chats-sidebar',
  templateUrl: './profile-chats-sidebar.component.html',
  styleUrls: ['./profile-chats-sidebar.component.scss'],
})
export class ProfileChatsSidebarComponent
  implements AfterViewInit, OnChanges, OnInit
{
  chatList: any = [];
  pendingChatList: any = [];
  groupList: any = [];

  @ViewChild('userSearchDropdownRef', { static: false, read: NgbDropdown })
  userSearchNgbDropdown: NgbDropdown;
  searchText = '';
  userList: any = [];
  profileId: number;
  chatData: any = [];
  selectedChatUser: any;
  showUserProfile: boolean = false;

  isMessageSoundEnabled: boolean;
  isCallSoundEnabled: boolean;
  backCanvas: boolean = true;
  isChatLoader = false;
  selectedButton: string = 'chats';
  newChatList = [];
  @Output('newRoomCreated') newRoomCreated: EventEmitter<any> =
    new EventEmitter<any>();
  @Output('onNewChat') onNewChat: EventEmitter<any> = new EventEmitter<any>();
  @Input('isRoomCreated') isRoomCreated: boolean = false;
  @Input('selectedRoomId') selectedRoomId: number = null;
  userStatus: string;
  constructor(
    private customerService: CustomerService,
    private socketService: SocketService,
    public sharedService: SharedService,
    public messageService: MessageService,
    private activeOffcanvas: NgbActiveOffcanvas,
    private activeCanvas: NgbOffcanvas,
    private route: ActivatedRoute,
    private router: Router,
    private toasterService: ToastService,
    public encryptDecryptService: EncryptDecryptService,
    private modalService: NgbModal
  ) {
    this.profileId = +localStorage.getItem('profileId');
    // const notificationSound =
    //   JSON.parse(localStorage.getItem('soundPreferences')) || {};
    // if (notificationSound?.messageSoundEnabled === 'N') {
    //   this.isMessageSoundEnabled = false;
    // }
    // if (notificationSound?.callSoundEnabled === 'N') {
    //   this.isCallSoundEnabled = false;
    // }
    this.sharedService.loginUserInfo.subscribe((user) => {
      this.isCallSoundEnabled =
        user?.callNotificationSound === 'Y' ? true : false;
      this.isMessageSoundEnabled =
        user?.messageNotificationSound === 'Y' ? true : false;
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    this.sharedService
      .getIsRoomCreatedObservable()
      .subscribe((isRoomCreated) => {
        if (isRoomCreated) {
          this.isRoomCreated = isRoomCreated;
          this.getChatList();
          this.getGroupList();
        } else {
          this.selectedChatUser = null;
        }
      });
  }

  ngOnInit(): void {
    // this.chatData = history.state.chatUserData;
    this.route.queryParams.subscribe((params) => {
      if (params['chatUserData']) {
        this.chatData = JSON.parse(decodeURIComponent(params['chatUserData']));
        this.router.navigate([], { relativeTo: this.route, queryParams: {} });
      }
    });
    this.socketService.connect();
    this.getChatList();
    this.getGroupList();
    this.backCanvas = this.activeCanvas.hasOpenOffcanvas();
    if (this.chatData && !this.backCanvas) {
      this.checkRoom();
    }
  }

  ngAfterViewInit(): void {
    // this.getGroupList();
    if (this.isRoomCreated) {
      this.getChatList();
      this.getGroupList();
    }
    this.socketService.socket?.on('accept-invitation', (data) => {
      if (data) {
        this.onChat(data);
        this.getChatList();
      }
    });
  }

  getUserList(): void {
    this.customerService.getProfileList(this.searchText).subscribe({
      next: (res: any) => {
        if (res?.data?.length > 0) {
          this.userList = res.data.filter(
            (user: any) => user.Id !== this.sharedService?.userData?.profileId
          );
          this.userList = this.userList.filter(
            (user: any) =>
              !this.chatList.some(
                (chatUser: any) => chatUser.profileId === user.Id
              ) &&
              !this.pendingChatList.some(
                (chatUser: any) => chatUser.profileId === user.Id
              )
          );
          this.userSearchNgbDropdown?.open();
        } else {
          this.userList = [];
          this.userSearchNgbDropdown?.close();
        }
      },
      error: () => {
        this.userList = [];
        this.userSearchNgbDropdown?.close();
      },
    });
  }

  getChatList() {
    this.isChatLoader = true;
    this.socketService?.getChatList({ profileId: this.profileId }, (data) => {
      this.isChatLoader = false;
      this.chatList = data?.filter(
        (user: any) =>
          user.Username != this.sharedService?.userData?.Username &&
          user?.isAccepted === 'Y'
      );
      this.mergeUserChatList();
      this.pendingChatList = data.filter(
        (user: any) => user.isAccepted === 'N'
      );
    });
    return this.chatList;
  }

  dismissSidebar() {
    this.activeOffcanvas?.dismiss();
  }

  onChat(item: any) {
    this.selectedChatUser = item.roomId || item.groupId;
    item.unReadMessage = 0;
    if (item.groupId) {
      item.isAccepted = 'Y';
    }
    // this.notificationNavigation()
    this.onNewChat?.emit(item);
    if (this.searchText) {
      this.searchText = null;
    }
  }

  goToViewProfile(): void {
    this.router.navigate([`settings/view-profile/${this.profileId}`]);
  }

  toggleSoundPreference(property: string, ngModelValue: boolean): void {
    // const soundPreferences =
    //   JSON.parse(localStorage.getItem('soundPreferences')) || {};
    // soundPreferences[property] = ngModelValue ? 'Y' : 'N';
    // localStorage.setItem('soundPreferences', JSON.stringify(soundPreferences));
    const soundObj = {
      property: property,
      value: ngModelValue ? 'Y' : 'N',
    };
    this.customerService.updateNotificationSound(soundObj).subscribe({
      next: (res) => {
        this.toasterService.success(res.message);
        this.sharedService.getUserDetails();
      },
      error: (err) => {
        console.log(err);
      },
    });
  }

  clearChatList() {
    this.onNewChat?.emit({});
  }

  selectButton(buttonType: string): void {
    this.selectedButton =
      this.selectedButton === buttonType ? buttonType : buttonType;
  }

  getGroupList() {
    this.isChatLoader = true;
    this.socketService?.getGroup({ profileId: this.profileId }, (data) => {
      this.isChatLoader = false;
      this.groupList = data;
      this.mergeUserChatList();
    });
  }

  mergeUserChatList(): void {
    const chatList = this.chatList;
    const groupList = this.groupList;
    const mergeChatList = [...chatList, ...groupList];
    mergeChatList.sort(
      (a, b) =>
        new Date(b.updatedDate).getTime() - new Date(a.updatedDate).getTime()
    );
    if (mergeChatList?.length) {
      this.newChatList = mergeChatList.filter((ele) => {
        if (
          ele?.roomId === this.selectedChatUser ||
          ele?.groupId === this.selectedChatUser
        ) {
          ele.unReadMessage = 0;
          this.selectedChatUser = ele?.roomId || ele?.groupId;
          return ele;
        } else return ele;
      });
      this.messageService.chatList.push(this.newChatList);
    }
  }

  createNewGroup() {
    const modalRef = this.modalService.open(CreateGroupModalComponent, {
      centered: true,
      size: 'md',
    });
    modalRef.componentInstance.title = 'Create Group';
    modalRef.result.then((res) => {
      if (res) {
        this.socketService?.createGroup(res, (data: any) => {
          this.getChatList();
          this.getGroupList();
        });
      }
    });
  }
  appQrmodal() {
    const modalRef = this.modalService.open(AppQrModalComponent, {
      centered: true,
    });
  }
  uniqueLink() {
    const modalRef = this.modalService.open(ConferenceLinkComponent, {
      centered: true,
    });
  }

  deleteOrLeaveChat(item) {
    if (item.roomId) {
      const data = {
        roomId: item.roomId,
        profileId: item.profileId,
      };
      this.socketService?.deleteRoom(data, (data: any) => {
        this.getChatList();
        this.getGroupList();
        this.onNewChat?.emit({});
      });
    } else if (item.groupId) {
      const data = {
        profileId: this.profileId,
        groupId: item.groupId,
      };
      this.socketService.removeGroupMember(data, (res) => {
        this.getChatList();
        this.getGroupList();
        this.onNewChat?.emit({});
      });
    }
  }

  resendInvite(item) {
    if (item) {
      const date = moment(new Date()).utc();
      const data = {
        roomId: item.roomId,
        profileId: item.profileId,
        createdBy: item.createdBy,
        date: moment(date).format('YYYY-MM-DD HH:mm:ss'),
      };

      const hoursDifference = date.diff(item.createdDate, 'hours');
      if (hoursDifference > 24) {
        this.socketService?.resendChatInvite(data, (data: any) => {
          this.getChatList();
          this.getGroupList();
          this.onNewChat?.emit({});
          this.toasterService.success('invitation sent successfully.');
        });
      } else {
        this.toasterService.warring(
          'Please wait 24 hours before sending invitations again.'
        );
      }
    }
  }

  // removeRequest(item){
  //   if (item.roomId) {
  //     const data = {
  //       roomId: item.roomId,
  //       profileId: item.profileId,
  //     };
  //     this.socketService?.cancelRequest(data, (data: any) => {
  //       this.getChatList();
  //       this.getGroupList();
  //       this.onNewChat?.emit({});
  //     });
  //   }
  // }
  profileStatus(status: string) {
    const data = {
      status: status,
      id: this.profileId,
    };
    const localUserData = JSON.parse(localStorage.getItem('userData'));
    this.socketService.switchOnlineStatus(data, (res) => {
      this.sharedService.userData.userStatus = res.status;
      localUserData.userStatus = res.status;
      localStorage.setItem('userData', JSON.stringify(localUserData));
    });
  }
  findUserStatus(id: string): string {
    const user = this.sharedService.onlineUserList.find(
      (ele) => ele.userId === id
    );
    const status = user?.status;
    return status;
  }
  checkRoom(): void {
    const oldUserChat = {
      profileId1: this.profileId,
      profileId2: this.chatData.Id,
    };
    this.socketService.checkRoom(oldUserChat, (res: any) => {
      const data = res.find((obj) => obj.isDeleted === 'N');
      if (data && data.id) {
        const existingUser = {
          roomId: data.id,
          profileId: data.profileId1,
          Username: data.Username || this.chatData.Username,
          ProfilePicName: data.ProfilePicName || this.chatData.ProfilePicName,
          isAccepted: data.isAccepted,
          isDeleted: data.isDeleted,
          lastMessageText: data.lastMessageText,
          createdBy: this.chatData.Id,
        };
        this.selectedChatUser = existingUser.roomId;
        this.onNewChat?.emit(existingUser);
      } else {
        const newUser = {
          Id: this.chatData.Id,
          Username: this.chatData.Username,
          ProfilePicName: this.chatData.ProfilePicName,
          unReadMessage: 0,
        };
        this.onNewChat?.emit(newUser);
      }
    });
  }
}
