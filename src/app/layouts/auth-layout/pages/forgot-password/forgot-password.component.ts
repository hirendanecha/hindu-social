import { Component, Input, ViewChild } from '@angular/core';
import { NgForm, NgModel } from '@angular/forms';
import { NgbActiveModal, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { NgxSpinnerService } from 'ngx-spinner';
import { ConfirmationModalComponent } from 'src/app/@shared/modals/confirmation-modal/confirmation-modal.component';
import { AuthService } from 'src/app/@shared/services/auth.service';
import { TokenStorageService } from 'src/app/@shared/services/token-storage.service';

@Component({
  selector: 'app-forgot-password',
  templateUrl: './forgot-password.component.html',
  styleUrls: ['./forgot-password.component.scss'],
})
export class ForgotPasswordComponent {
  @Input() cancelButtonLabel: string | undefined;
  @Input() confirmButtonLabel: string | undefined;
  @Input() closeIcon: boolean | undefined;
  @ViewChild('verifyEmail') verifyEmail: NgForm | any;
  submitted = false;
  loading = false;
  msg = '';
  type = 'danger';
  EMAIL_REGEX = '[A-Za-z0-9._%-+-]+@[A-Za-z0-9._%-]+\\.[A-Za-z]{2,}';
  userEmail = '';
  constructor(
    public activeModal: NgbActiveModal,
    private authService: AuthService,
    private spinner: NgxSpinnerService,
    private tokenStorage: TokenStorageService,
    private modalService: NgbModal,
  ) {
    // this.userEmail = JSON.parse(localStorage.getItem('userData'))?.Email;
  }
  
  verifyEmailSend(): void {
    if (this.userEmail) {
      this.spinner.show();
      this.authService
        .forgotPassword({
          email: this.userEmail,
        })
        .subscribe({
          next:
            (result: any) => {
              this.spinner.hide();
              this.submitted = false;
              if (!result.error) {
                this.activeModal.close('success');
                this.loading = false;
                this.msg =
                  'If the entered email exists you will receive a email to change your password.';
                this.type = 'success';
              } else {
                this.activeModal.close('success');
                this.msg = result.message;
                this.type = 'danger';
                this.loading = false;
              }
            },
          error:
            (error) => {
              this.activeModal.close('success');
              this.spinner.hide();
              this.loading = false;
            }
        });
    } else  {
      this.msg = 'Please enter valid email address';
      this.type = 'danger';
    }
  }

  validatepassword(password, cPassword) {
    const pattern =
      '(?=.*[A-Z])(?=.*[!@#$&*])(?=.*[a-z])(?=.*[0-9].*[0-9]).{8}';
    if (!password.match(pattern)) {
      this.msg =
        'Password must be a minimum of 8 characters and include one uppercase letter, one lowercase letter and one special character';
      return false;
    }
    if (password !== cPassword) {
      this.msg = 'Passwords does not match.';
      return false;
    }

    return true;
  }

  // openAlertMessage(): void {
  //   this.activeModal.close()
  //   const modalRef = this.modalService.open(ConfirmationModalComponent, {
  //     centered: true,
  //   });
  //   modalRef.componentInstance.title = `Confirmation message`;
  //   modalRef.componentInstance.confirmButtonLabel = 'Ok';
  //   modalRef.componentInstance.cancelButtonLabel = 'Cancel';
  //   modalRef.componentInstance.message = `Are you sure want to change password?`;
  //   modalRef.result.then((res) => {
  //     if (res === 'success') {
  //       this.verifyEmailSend();
  //       // this.verifyEmailSend(this.verifyEmail)


  //     }
  //   });
  // }
}
