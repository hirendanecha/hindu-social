import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { BugReportService } from 'src/app/@shared/services/bug-report.service';
import { PostService } from 'src/app/@shared/services/post.service';
import { SeoService } from 'src/app/@shared/services/seo.service';
import { ToastService } from 'src/app/@shared/services/toast.service';
import { UploadFilesService } from 'src/app/@shared/services/upload-files.service';

@Component({
  selector: 'app-support-contact',
  templateUrl: './support-contact.component.html',
  styleUrls: ['./support-contact.component.scss'],
})
export class SupportContactComponent implements OnInit {
  reportForm: FormGroup;
  selectedFile: any;
  viewUrl: any;
  viewVideoUrl: any;
  isFileUploadInProgress: boolean = false;

  constructor(
    private seoService: SeoService,
    private fb: FormBuilder,
    private bugReportService: BugReportService,
    private uploadFilesService: UploadFilesService,
    private toasterService: ToastService
  ) {
    const data = {
      title: 'Support Contact',
      url: `${location.href}`,
      description: '',
    };
    this.seoService.updateSeoMetaData(data);
  }

  ngOnInit(): void {
    this.reportForm = this.fb.group({
      name: ['', Validators.required],
      email: ['', Validators.required],
      description: ['', Validators.required],
      media: [''],
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
    if (this.selectedFile) {
      this.isFileUploadInProgress = true;
      this.uploadFilesService.uploadFile(this.selectedFile).subscribe({
        next: (res: any) => {
          if (res?.body?.url) {
            this.isFileUploadInProgress = false;
            this.reportForm.get('media').setValue(res?.body?.url);
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
  }
  submitForm(): void {
    if (this.reportForm.valid) {
      this.bugReportService.supportContact(this.reportForm.value).subscribe({
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
