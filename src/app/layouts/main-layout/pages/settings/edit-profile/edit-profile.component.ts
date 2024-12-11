import {
  AfterViewInit,
  Component,
  ElementRef,
  OnInit,
  ViewChild,
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { NgxSpinnerService } from 'ngx-spinner';
import { Subject, forkJoin } from 'rxjs';
import { ConfirmationModalComponent } from 'src/app/@shared/modals/confirmation-modal/confirmation-modal.component';
import { Customer } from 'src/app/@shared/constant/customer';
import { CustomerService } from 'src/app/@shared/services/customer.service';
import { SharedService } from 'src/app/@shared/services/shared.service';
import { TokenStorageService } from 'src/app/@shared/services/token-storage.service';
import { ToastService } from 'src/app/@shared/services/toast.service';
import { UploadFilesService } from 'src/app/@shared/services/upload-files.service';
import { FormControl, FormGroup } from '@angular/forms';

@Component({
  selector: 'app-edit-profile',
  templateUrl: './edit-profile.component.html',
  styleUrls: ['./edit-profile.component.scss'],
})
export class EditProfileComponent implements OnInit, AfterViewInit {
  resetImageClosebtn = true;
  customer: Customer = new Customer();
  allCountryData: any;
  confirm_password = '';
  msg = '';
  userId: number;
  userMail: string;
  profilePic: any = {};
  coverPic: any = {};
  profileId: number;
  userlocalId: number;
  @ViewChild('zipCode') zipCode: ElementRef;
  uploadListSubject: Subject<void> = new Subject<void>();
  profileImg: any = {
    file: null,
    url: '',
  };
  profileCoverImg: any = {
    file: null,
    url: '',
  };
  isNotificationSoundEnabled: boolean = true;
  isMessageSoundEnabled: boolean;
  isCallSoundEnabled: boolean;
  isMessageEmailEnabled: boolean;
  isTagEmailEnabled: boolean;

  editForm = new FormGroup({
    FirstName: new FormControl(''),
    LastName: new FormControl(''),
    Username: new FormControl(''),
    Email: new FormControl({
      value: this.customer?.Email || '',
      disabled: true,
    }),
    Country: new FormControl(''),
    Zip: new FormControl(''),
    State: new FormControl(''),
    City: new FormControl(''),
    County: new FormControl(''),
    MobileNo: new FormControl(''),
    ProfilePicName: new FormControl(''),
    CoverPicName: new FormControl(''),
    UserID: new FormControl<number | null>(null),
    profileId: new FormControl<number | null>(null),
    IsActive: new FormControl('Y'),
    messageNotificationEmail: new FormControl(''),
    postNotificationEmail: new FormControl(''),
    tagNotificationSound: new FormControl(''),
    messageNotificationSound: new FormControl(''),
    callNotificationSound: new FormControl(''),
  });

  constructor(
    private modalService: NgbModal,
    private route: ActivatedRoute,
    private router: Router,
    private customerService: CustomerService,
    private spinner: NgxSpinnerService,
    private tokenStorage: TokenStorageService,
    public sharedService: SharedService,
    private toastService: ToastService,
    private uploadService: UploadFilesService
  ) {
    this.spinner.hide();
    this.userId = +this.route.snapshot.paramMap.get('id');
    this.sharedService.loggedInUser$.subscribe((user) => {
      this.customer = user;
      this.userlocalId = user?.UserID;
      this.profileId = user?.profileId;
      this.userMail = user?.Email;
      this.editForm.patchValue({
        FirstName: this.customer?.FirstName || '',
        LastName: this.customer?.LastName || '',
        Username: this.customer?.Username || '',
        Email: this.customer?.Email || '',
        Country: this.customer?.Country || '',
        Zip: this.customer?.Zip || '',
        State: this.customer?.State || '',
        City: this.customer?.City || '',
        County: this.customer?.County || '',
        MobileNo: this.customer?.MobileNo || '',
        ProfilePicName: this.customer?.ProfilePicName || '',
        CoverPicName: this.customer?.CoverPicName || '',
        UserID: this.customer?.UserID || +this.userId,
        profileId: this.profileId || +this.profileId,
        tagNotificationSound: user?.tagNotificationSound || null,
        postNotificationEmail: user?.postNotificationEmail || null,
        messageNotificationSound: user?.messageNotificationSound || null,
        callNotificationSound: user?.callNotificationSound || null,
        messageNotificationEmail: user?.messageNotificationEmail || null
      });
    });
  }
  ngOnInit(): void {
    if (!this.tokenStorage.getToken()) {
      this.router.navigate([`/login`]);
    }
    this.modalService.dismissAll();
    // const notificationSound = JSON.parse(
    //   localStorage.getItem('soundPreferences')
    // )?.notificationSoundEnabled;
    this.sharedService.loginUserInfo.subscribe((user) => {
      this.isNotificationSoundEnabled =
        user?.tagNotificationSound === 'Y' ? true : false;
      this.isCallSoundEnabled =
        user?.callNotificationSound === 'Y' ? true : false;
      this.isMessageSoundEnabled =
        user?.messageNotificationSound === 'Y' ? true : false;
      this.isMessageEmailEnabled =
        user?.messageNotificationEmail === 'Y' ? true : false;
      this.isTagEmailEnabled =
        user?.postNotificationEmail === 'Y' ? true : false;
    });

    this.getAllCountries();
  }

  ngAfterViewInit(): void {}

  toggleSoundPreference(property: string, ngModelValue: boolean): void {
    const soundObj = {
      property: property,
      value: ngModelValue ? 'Y' : 'N',
    };
    this.customerService.updateNotificationSound(soundObj).subscribe({
      next: (res) => {
        this.toastService.success(res.message);
        this.sharedService.getUserDetails();
      },
      error: (err) => {
        console.log(err);
      },
    });
  }

  getAllCountries() {
    this.customerService.getCountriesData().subscribe({
      next: (result) => {
        this.allCountryData = result;
      },
      error: (error) => {
        console.log(error);
      },
    });
  }

  confirmAndUpdateCustomer(): void {
    if (this.profileId) {
      const modalRef = this.modalService.open(ConfirmationModalComponent, {
        centered: true,
      });
      modalRef.componentInstance.title = 'Update Profile';
      modalRef.componentInstance.confirmButtonLabel = 'Update';
      modalRef.componentInstance.cancelButtonLabel = 'Cancel';
      modalRef.componentInstance.message =
        'Are you sure want to update profile details?';

      modalRef.result.then((res) => {
        if (res === 'success') {
          this.uploadImgAndUpdateCustomer();
        }
      });
    }
  }

  uploadImgAndUpdateCustomer(): void {
    let uploadObs = {};
    if (this.profileImg?.file?.name) {
      uploadObs['profileImg'] = this.uploadService.uploadFile(
        this.profileImg?.file
      );
    }

    if (this.profileCoverImg?.file?.name) {
      uploadObs['profileCoverImg'] = this.uploadService.uploadFile(
        this.profileCoverImg?.file
      );
    }

    if (Object.keys(uploadObs)?.length > 0) {
      this.spinner.show();
      forkJoin(uploadObs).subscribe({
        next: (res: any) => {
          if (res?.profileImg?.body?.url) {
            this.profileImg['file'] = null;
            this.profileImg['url'] = res?.profileImg?.body?.url;
            this.sharedService['userData']['ProfilePicName'] =
              this.profileImg['url'];
            this.editForm.patchValue({
              ProfilePicName: this.profileImg['url'],
            });
          }
          if (res?.profileCoverImg?.body?.url) {
            this.profileCoverImg['file'] = null;
            this.profileCoverImg['url'] = res?.profileCoverImg?.body?.url;
            this.sharedService['userData']['CoverPicName'] =
              this.profileCoverImg['url'];
            this.editForm.patchValue({
              CoverPicName: this.profileCoverImg['url'],
            });
          }
          this.updateCustomer();
          this.spinner.hide();
        },
        error: (err) => {
          this.spinner.hide();
        },
      });
    } else {
      this.updateCustomer();
    }
  }

  updateCustomer(): void {
    if (this.profileId) {
      this.spinner.show();
      this.customerService
        .updateProfile(this.profileId, this.editForm.value)
        .subscribe({
          next: (res: any) => {
            this.spinner.hide();
            if (!res.error) {
              this.toastService.success(res.message);
              this.sharedService.getUserDetails();
              this.resetImageClosebtn = false;
            } else {
              this.toastService.danger(res?.message);
            }
          },
          error: (error) => {
            console.log(error.error.message);
            this.spinner.hide();
            this.toastService.danger(error.error.message);
          },
        });
    }
  }

  onProfileImgChange(event: any): void {
    this.profileImg = event;
    this.resetImageClosebtn = true;
  }

  onProfileCoverImgChange(event: any): void {
    this.profileCoverImg = event;
    this.resetImageClosebtn = true;
  }

  deleteAccount(): void {
    const modalRef = this.modalService.open(ConfirmationModalComponent, {
      centered: true,
    });
    modalRef.componentInstance.title = 'Delete Account';
    modalRef.componentInstance.confirmButtonLabel = 'Delete';
    modalRef.componentInstance.cancelButtonLabel = 'Cancel';
    modalRef.componentInstance.message =
      'Are you sure want to delete your account?';
    modalRef.result.then((res) => {
      if (res === 'success') {
        this.customerService
          .deleteCustomer(this.userlocalId, this.profileId)
          .subscribe({
            next: (res: any) => {
              if (res) {
                this.toastService.success(
                  res.message || 'Account deleted successfully'
                );
                this.tokenStorage.signOut();
                this.router.navigateByUrl('register');
              }
            },
            error: (error) => {
              console.log(error);
              this.toastService.success(error.message);
            },
          });
      }
    });
  }

  onChangeTag(event: Event): void {
    const inputElement = event.target as HTMLInputElement;
    const value = inputElement.value
      .replaceAll(' ', '')
      .replaceAll(/\s*,+\s*/g, ',');
    this.editForm.patchValue({
      Username: value,
    });
  }

  convertToUppercase(event: Event): void {
    const inputElement = event.target as HTMLInputElement;
    let inputValue = inputElement.value.replace(/\s/g, '');
    inputElement.value = inputValue.toUpperCase();
    this.editForm.patchValue({
      Zip: inputElement.value,
    });
  }
}
