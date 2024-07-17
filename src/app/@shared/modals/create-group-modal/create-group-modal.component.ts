import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { NgbActiveModal, NgbDropdown } from '@ng-bootstrap/ng-bootstrap';
import { CustomerService } from '../../services/customer.service';
import { Router } from '@angular/router';
import { SocketService } from '../../services/socket.service';
import { SharedService } from '../../services/shared.service';

@Component({
  selector: 'app-create-group-modal',
  templateUrl: './create-group-modal.component.html',
  styleUrls: ['./create-group-modal.component.scss'],
})
export class CreateGroupModalComponent implements OnInit {
  @Input() cancelButtonLabel: string = 'Cancel';
  @Input() confirmButtonLabel: string = 'Done';
  @Input() title: string = 'Add to Group';
  @Input() message: string;
  @Input() data: any;
  @Input() groupId: number;
  profileId: number;
  searchText = '';
  userList: any = [];

  addedInvitesList: any[] = [];

  @ViewChild('userSearchDropdownRef', { static: false, read: NgbDropdown })
  userSearchNgbDropdown: NgbDropdown;
  isOpenUserMenu = false;

  constructor(
    public activateModal: NgbActiveModal,
    private customerService: CustomerService,
    private sharedService: SharedService
  ) {
    this.profileId = +localStorage.getItem('profileId');
  }

  ngOnInit(): void {
    if (this.data) {
      this.addedInvitesList.push(this.data);
    }
  }

  getUserList(): void {
    this.customerService.getProfileList(this.searchText).subscribe({
      next: (res: any) => {
        if (res?.data?.length > 0) {
          const userList = res.data.filter((user: any) => {
            return user.Id !== this.sharedService?.userData?.Id;
          });
          this.userList = userList.filter((user) => {
            return !this.addedInvitesList.some(
              (invite) => invite.Id === user.Id
            );
          });
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

  addProfile(user) {
    this.addedInvitesList.push(user);
    this.searchText = '';
  }

  removeUser(item) {
    this.addedInvitesList = this.addedInvitesList.filter(
      (user) => user.Id !== item.Id
    );
  }

  createGroup() {
    let groupMembers = this.addedInvitesList.map((item) => item.Id);
    let groupMembersName = this.addedInvitesList.map((item) => item.Username);
    let commaSeparatedString = groupMembersName.join(', ');
    const groupData = {
      profileId: this.profileId,
      groupName: commaSeparatedString,
      profileIds: groupMembers,
      groupId: this.groupId || null,
      isUpdate: true
    };
    this.activateModal.close(groupData);
  }
}
