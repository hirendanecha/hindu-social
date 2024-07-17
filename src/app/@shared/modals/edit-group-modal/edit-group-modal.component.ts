import {
  Component,
  EventEmitter,
  Input,
  OnInit,
  Output,
  ViewChild,
} from '@angular/core';
import {
  NgbActiveModal,
  NgbDropdown,
  NgbModal,
} from '@ng-bootstrap/ng-bootstrap';
import { CustomerService } from '../../services/customer.service';
import { Router } from '@angular/router';
import { SocketService } from '../../services/socket.service';
import { PostService } from '../../services/post.service';
import { ConfirmationModalComponent } from '../confirmation-modal/confirmation-modal.component';
import { SharedService } from '../../services/shared.service';
import { FormControl, Validators } from '@angular/forms';
import { ToastService } from '../../services/toast.service';

@Component({
  selector: 'app-edit-group-modal',
  templateUrl: './edit-group-modal.component.html',
  styleUrls: ['./edit-group-modal.component.scss'],
})
export class EditGroupModalComponent implements OnInit {
  @Input() cancelButtonLabel: string = 'Leave Group';
  @Input() confirmButtonLabel: string = 'Done';
  @Input() title: string = 'Edit Group Details';
  @Input() message: string;
  @Input() data: any;
  @Input() groupId: number;

  profileId: number;
  searchText = '';
  userList: any = [];
  changeGroupName: string;
  addedInvitesList: any[] = [];
  showInputField: boolean = false;
  profileImg: any = {
    file: null,
    url: '',
  };

  @ViewChild('userSearchDropdownRef', { static: false, read: NgbDropdown })
  userSearchNgbDropdown: NgbDropdown;
  isOpenUserMenu = false;
  chanageGroupNameFormControl = new FormControl('', [
    Validators.pattern(/^\S.*\S$/),
  ]);
  constructor(
    public activateModal: NgbActiveModal,
    private customerService: CustomerService,
    private postService: PostService,
    private socketService: SocketService,
    private modalService: NgbModal,
    private router: Router,
    private sharedService: SharedService,
    private toastService: ToastService
  ) {
    this.profileId = +localStorage.getItem('profileId');
  }

  ngOnInit(): void {
    if (this.data) {
      this.profileImg.url = this.data.profileImage;
      this.changeGroupName = this.data.groupName;
    }
    console.log(this.data);
  }

  getUserList(): void {
    this.customerService.getProfileList(this.searchText).subscribe({
      next: (res: any) => {
        if (res?.data?.length > 0) {
          this.userList = res.data.filter((user: any) => {
            return (
              user.Id !== this.sharedService?.userData?.Id &&
              !this.addedInvitesList.some((invite) => invite.Id === user.Id) &&
              !this.data.memberList.some(
                (member) => member.profileId === user.Id
              )
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

  selectFiles(event) {
    this.profileImg = event;
  }

  clearProfileImg(event: any): void {
    event.stopPropagation();
    event.preventDefault();
    this.profileImg = {
      file: null,
      url: '',
    };
  }

  editGroupName() {
    this.showInputField = !this.showInputField;
  }

  upload() {
    if (this.chanageGroupNameFormControl.valid) {
      if (this.profileImg.file) {
        this.postService.uploadFile(this.profileImg.file).subscribe({
          next: (res: any) => {
            if (res?.body?.url) {
              this.profileImg.url = res?.body?.url;
              this.editGroup();
            }
          },
        });
      } else {
        this.editGroup();
      }
    } else {
      this.toastService.danger('Something went wrong please try again!');
    }
  }

  editGroup() {
    if (
      this.addedInvitesList?.length ||
      this.changeGroupName !== this.data.groupName ||
      this.profileImg.file
    ) {
      let groupMembers =
        this.addedInvitesList?.length > 0
          ? this.addedInvitesList.map((item) => item.Id)
          : this.data?.memberList?.map((item) => {
              return item.profileId;
            });
      const isUpdate = this.addedInvitesList.length ? true : false;
      const groupData = {
        profileId: this.profileId,
        profileImage: this.profileImg.url,
        groupName: this.changeGroupName,
        profileIds: groupMembers,
        groupId: this.groupId,
        isUpdate: isUpdate,
      };
      console.log(groupData);
      console.log(this.addedInvitesList);

      this.activateModal.close(groupData);
    } else {
      this.activateModal.close(this.data);
    }
  }

  removeGroupUser(id) {
    const modalRef = this.modalService.open(ConfirmationModalComponent, {
      centered: true,
      backdrop: 'static',
    });
    modalRef.componentInstance.title = `${
      id === this.profileId ? 'Leave' : 'Remove user'
    } from conversation`;
    modalRef.componentInstance.confirmButtonLabel = `${
      id === this.profileId ? 'Leave' : 'Remove'
    }`;
    modalRef.componentInstance.cancelButtonLabel = 'Cancel';
    modalRef.componentInstance.message = `Are you sure want to ${
      id === this.profileId ? 'leave' : 'remove'
    }?`;
    modalRef.result.then((res) => {
      if (res === 'success') {
        const data = {
          profileId: id,
          groupId: this.groupId,
        };
        this.socketService.removeGroupMember(data, (res) => {
          this.data = { ...res };
          console.log(this.data);
        });
        if (id === this.profileId) {
          this.activateModal.close('cancel');
        }
      }
    });
  }
}
