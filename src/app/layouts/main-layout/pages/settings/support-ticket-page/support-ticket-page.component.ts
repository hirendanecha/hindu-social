import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { BugReportService } from 'src/app/@shared/services/bug-report.service';
import { SeoService } from 'src/app/@shared/services/seo.service';
import { ToastService } from 'src/app/@shared/services/toast.service';
import { UploadFilesService } from 'src/app/@shared/services/upload-files.service';

@Component({
  selector: 'app-support-ticket-page',
  templateUrl: './support-ticket-page.component.html',
  styleUrls: ['./support-ticket-page.component.scss'],
})
export class SupportTicketPageComponent implements OnInit {
  reportForm: FormGroup;
  selectedFile: any;
  viewUrl: any;
  viewVideoUrl: any;
  isFileUploadInProgress: boolean = false;
  profileId: number;

  constructor(
    private seoService: SeoService,
    private fb: FormBuilder,
    private uploadFilesService: UploadFilesService,
    private bugReportService: BugReportService,
    private toasterService: ToastService
  ) {
    const data = {
      title: 'Support Ticket page',
      url: `${location.href}`,
      description: '',
    };
    this.seoService.updateSeoMetaData(data);
    this.profileId = +localStorage.getItem('profileId');
  }

  ngOnInit(): void {
    this.reportForm = this.fb.group({
      profileId: [this.profileId],
      deviceName: ['', Validators.required],
      browserName: [''],
      description: [''],
      attachmentFiles: ['', Validators.required],
    });
  }

  onPostFileSelect(event: any): void {
    const file = event.target?.files?.[0] || {};
    if (file.type.includes('application/')) {
      this.selectedFile = file;
      // this.pdfName = file?.name;
      this.viewUrl = URL.createObjectURL(file);
    } else if (file.type.includes('video/')) {
      this.selectedFile = file;
      this.viewVideoUrl = URL.createObjectURL(file);
    } else if (file.type.includes('image/')) {
      this.selectedFile = file;
      this.viewUrl = URL.createObjectURL(file);
    }
  }

  removeSelectedFile(): void {
    this.viewUrl = null;
    this.viewVideoUrl = null;
    this.selectedFile = null;
  }

  uploadAttachment() {
    if (this.profileId) {
      if (this.selectedFile) {
        this.isFileUploadInProgress = true;
        this.uploadFilesService.uploadFile(this.selectedFile).subscribe({
          next: (res: any) => {
            if (res?.body?.url) {
              this.isFileUploadInProgress = false;
              this.reportForm.get('attachmentFiles').setValue(res?.body?.url);
              this.submitForm();
            }
          },
          error: (err) => {
            this.isFileUploadInProgress = false;
            console.log(err);
          },
        });
      } else {
        this.submitForm();
      }
    } else {
      this.toasterService.danger('Please login first');
    }
  }
  submitForm(): void {
      this.reportForm.get('profileId').setValue(this.profileId);
      if (this.reportForm.valid) {
        this.bugReportService.reportAbug(this.reportForm.value).subscribe({
          next: (res: any) => {
            this.toasterService.success(res.message);
            this.resetForm();
          },
          error: (error) => {
            this.toasterService.danger('something went wrong please try again!');
            console.log(error);
          },
        });
      } else {
        this.toasterService.danger('please fill require data');
      }
  }

  resetForm() {
    this.reportForm.reset();
    this.removeSelectedFile();
  }
}
