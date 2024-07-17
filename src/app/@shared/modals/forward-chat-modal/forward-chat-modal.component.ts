import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { NgbActiveModal, NgbDropdown } from '@ng-bootstrap/ng-bootstrap';
import { CustomerService } from '../../services/customer.service';
import { Router } from '@angular/router';
import { SocketService } from '../../services/socket.service';
import { SharedService } from '../../services/shared.service';
import { MessageService } from '../../services/message.service';
import { EncryptDecryptService } from '../../services/encrypt-decrypt.service';
import { FILE_EXTENSIONS, FILE_EXTENSIONS_Video } from '../../constant/file-extensions';

@Component({
  selector: 'app-forward-chat-modal',
  templateUrl: './forward-chat-modal.component.html',
  styleUrls: ['./forward-chat-modal.component.scss'],
})
export class ForwardChatModalComponent implements OnInit {
  @Input() cancelButtonLabel: string = 'Cancel';
  @Input() confirmButtonLabel: string = 'Done';
  @Input() title: string = 'Forward Message';
  @Input() data: any;
  profileId: number;
  searchText = '';
  message: any = [];
  userList: any = [];
  selectedItems: any[] = [];
  addedInvitesList: any[] = [];
  textInput: string = '';
  filteredChatList = [];

  @ViewChild('userSearchDropdownRef', { static: false, read: NgbDropdown })
  userSearchNgbDropdown: NgbDropdown;
  isOpenUserMenu = false;

  constructor(
    public activateModal: NgbActiveModal,
    private customerService: CustomerService,
    private sharedService: SharedService,
    public messageService: MessageService,
    public socketService: SocketService,
    public encryptDecryptService: EncryptDecryptService
  ) {
    this.profileId = +localStorage.getItem('profileId');
  }

  ngOnInit(): void {
    this.message = this.data;
    this.getUserList();
  }

  getUserList(): void {
    // this.customerService.getProfileList(this.searchText).subscribe({
    //   next: (res: any) => {
    //     if (res?.data?.length > 0) {
    //       const userList = res.data.filter((user: any) => {
    //         return user.Id !== this.sharedService?.userData?.Id;
    //       });
    //       this.userList = userList.filter((user) => {
    //         return !this.addedInvitesList.some(
    //           (invite) => invite.Id === user.Id
    //         );
    //       });
    //       this.userSearchNgbDropdown.open();
    //     } else {
    //       this.userList = [];
    //       this.userSearchNgbDropdown.close();
    //     }
    //   },
    //   error: () => {
    //     this.userList = [];
    //     this.userSearchNgbDropdown.close();
    //   },
    // });
    if (this.searchText) {
      const searchTextLower = this.searchText.toLowerCase();
      this.filteredChatList = this.messageService.chatList[1].filter(
        (ele: any) => {
          return (
            ele?.Username?.toLowerCase().includes(searchTextLower) ||
            ele?.groupName?.toLowerCase().includes(searchTextLower)
          );
        }
      );
    } else {
      this.filteredChatList = this.messageService.chatList[1];
    }
  }

  addProfile(user) {
    // this.messageService.chatList.push(user);
    // this.searchText = '';
  }

  isFileOrVideo(media: any): boolean {
    return this.isFile(media) || this.isVideoFile(media);
  }

  isFile(media: string): boolean {
    const File = FILE_EXTENSIONS;
    return File.some((ext) => media?.endsWith(ext));
  }

  isVideoFile(media: string): boolean {
    const FILE_EXTENSIONS = FILE_EXTENSIONS_Video;
    return FILE_EXTENSIONS.some((ext) => media?.endsWith(ext));
  }

  isButtonDisabled(item: any): boolean {
    return this.selectedItems.some((disabledItem) => disabledItem === item);
  }

  sentMsgTo(data) {
    const index = this.selectedItems.indexOf(data);
    if (index === -1) {
      this.selectedItems.push(data);
    } else {
      this.selectedItems.splice(index, 1);
    }
    const lastSelectedItem = this.selectedItems[this.selectedItems.length - 1];
    this.sendUserMessage(lastSelectedItem);
  }

  sendUserMessage(message: any) {
    const messageText =
      this.textInput !== null
        ? this.encryptDecryptService?.encryptUsingAES256(this.textInput)
        : null;
    const data = {
      messageText: messageText,
      roomId: message?.roomId || null,
      groupId: message?.groupId || null,
      sentBy: this.profileId,
      profileId: message.profileId,
      parentMessageId: this.data.id || null,
    };
    this.socketService.sendMessage(data, async (data: any) => {});
  }
}
