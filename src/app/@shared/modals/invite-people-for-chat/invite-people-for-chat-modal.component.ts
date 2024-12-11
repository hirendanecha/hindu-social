import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  ElementRef,
  Input,
  Renderer2,
  ViewChild,
} from '@angular/core';
import { NgbActiveModal, NgbDropdown } from '@ng-bootstrap/ng-bootstrap';
import { ToastService } from '../../services/toast.service';
import { getTagUsersFromAnchorTags } from '../../utils/utils';
import { CustomerService } from '../../services/customer.service';
import { SharedService } from '../../services/shared.service';

@Component({
  selector: 'app-invite-people-for-chat-modal',
  templateUrl: './invite-people-for-chat-modal.component.html',
  styleUrls: ['./invite-people-for-chat-modal.component.scss'],
})
export class InvitePeopleForChatModalComponent {
  @Input() cancelButtonLabel: string = 'Cancel';
  @Input() confirmButtonLabel: string = 'Invite';
  @Input() title: string = 'Invite people to chat';
  @Input() chatList: any = [];
  @Input() pendingChatList: any = [];

  @ViewChild('userSearchDropdownRef', { static: false, read: NgbDropdown })
  userSearchNgbDropdown: NgbDropdown;
  searchText = '';
  userList: any = [];
  selectedUsers: any = {};

  constructor(
    public activeModal: NgbActiveModal,
    private toastService: ToastService,
    private renderer: Renderer2,
    private changeDetectorRef: ChangeDetectorRef,
    private customerService: CustomerService,
    private sharedService: SharedService
  ) {}

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

  onChat() {
    this.activeModal.close(this.selectedUsers);
  }

  addProfile(user) {
    this.selectedUsers = user;
    // this.addedInvitesList.push(user);
    this.searchText = '';
  }

  removeUser() {
    this.selectedUsers = {};
    // this.addedInvitesList = this.addedInvitesList.filter(
    //   (user) => user.Id !== item.Id
    // );
  }

  closeModal(): void {
    this.activeModal.close('cancel');
    this.sharedService.openModalSubject.next(null);
  }
}
