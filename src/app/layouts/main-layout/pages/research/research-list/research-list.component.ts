import { Component } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { NgbSlideEvent } from '@ng-bootstrap/ng-bootstrap';
import { NgxSpinnerService } from 'ngx-spinner';
import { BreakpointService } from 'src/app/@shared/services/breakpoint.service';
import { PostService } from 'src/app/@shared/services/post.service';
import { ProfileService } from 'src/app/@shared/services/profile.service';
import { SeoService } from 'src/app/@shared/services/seo.service';
import { SharedService } from 'src/app/@shared/services/shared.service';
import { SocketService } from 'src/app/@shared/services/socket.service';
import { ToastService } from 'src/app/@shared/services/toast.service';
import { UploadFilesService } from 'src/app/@shared/services/upload-files.service';
import {
  deleteExtraParamsFromReqObj,
  isFormSubmittedAndError,
  numToRevArray,
} from 'src/app/@shared/utils/utils';

@Component({
  selector: 'app-research-list',
  templateUrl: './research-list.component.html',
  styleUrls: ['./research-list.component.scss'],
})
export class ResearchListComponent {
  researches: any = [];
  btnGroupFeedTypeCtrl: FormControl;
  btnGroupViewTypeCtrl: FormControl;

  selectedImgFile: any;
  selectedpdfFile: any;
  selectedVideoFile: any;

  groupPosts: any = [];
  pagination: any = {
    page: 0,
    limit: 0,
    limitArray: [],
  };
  isGroupPostsLoader: boolean = false;

  tagInputDefaultData: string = '';
  researchForm = new FormGroup({
    posttoprofileid: new FormControl('', [Validators.required]),
    textpostdesc: new FormControl(''),
    postdescription: new FormControl('', [Validators.required]),
    keywords: new FormControl(''),
    posttype: new FormControl('R'),
    meta: new FormControl(null),
    isClicked: new FormControl(false),
    isSubmitted: new FormControl(false),
  });
  postVideoUrl: string;
  postVideo: any;
  postThumbfilename: any;

  postImageUrl: string;
  postImage: any;

  postFileUrl: string;
  postFile: any;

  constructor(
    private profileService: ProfileService,
    private postService: PostService,
    public sharedService: SharedService,
    private spinner: NgxSpinnerService,
    private breakpointService: BreakpointService,
    private toastService: ToastService,
    private seoService: SeoService,
    private uploadFilesService: UploadFilesService,
    private socketService: SocketService
  ) {
    const data = {
      title: 'Hindu.social Research',
      url: `${location.href}`,
      description: '',
    };
    this.seoService.updateSeoMetaData(data);
    this.btnGroupFeedTypeCtrl = new FormControl('All');
    this.btnGroupViewTypeCtrl = new FormControl('TopStories');

    this.breakpointService.screen.subscribe((res) => {
      if (res.sm.lessThen && this.pagination.limit !== 1) {
        this.pagination = {
          page: 7,
          limit: 1,
          limitArray: numToRevArray(1),
        };

        this.groupsAndPosts();
      } else if (res.md.lessThen && this.pagination.limit !== 2) {
        this.pagination = {
          page: 4,
          limit: 2,
          limitArray: numToRevArray(2),
        };

        this.groupsAndPosts();
      } else if (res.md.gatherThen && this.pagination.limit !== 3) {
        this.pagination = {
          page: 3,
          limit: 3,
          limitArray: numToRevArray(3),
        };

        this.groupsAndPosts();
      }
    });

    this.getGroups();
  }

  get formIsClicked(): FormControl {
    return this.researchForm.get('isClicked') as FormControl;
  }

  get formIsSubmitted(): FormControl {
    return this.researchForm.get('isSubmitted') as FormControl;
  }

  onTagUserInputChangeEvent(data: any, ctrlName: string): void {
    this.researchForm.get(ctrlName).setValue(data?.html);
    this.researchForm.get('meta').setValue(data?.meta || {});
  }
  onTagUserInputDescription(data: any, ctrlName: string): void {
    this.researchForm.get(ctrlName).setValue(data?.html);
  }

  groupsAndPosts(): void {
    this.isGroupPostsLoader = true;

    this.profileService.groupsAndPosts().subscribe({
      next: (res: any) => {
        if (res?.length > 0) {
          this.groupPosts = res;
        }
      },
      error: (err) => {
        this.groupPosts = [];
      },
      complete: () => {
        this.isGroupPostsLoader = false;
      },
    });
  }

  getGroups(): void {
    this.spinner.show();

    this.profileService.getGroups().subscribe({
      next: (res: any) => {
        if (res?.length > 0) {
          this.researches = res;
        }
        this.spinner.hide();
      },
      error: () => {
        this.spinner.hide();
      },
    });
  }

  getNextPageGroupPostsById(event: NgbSlideEvent, group: any): void {
    if (event.source === 'arrowRight') {
      if (!group?.page) {
        group['page'] = this.pagination.page;
      } else {
        group.page += 1;
      }

      this.profileService
        .getGroupPostById(group?.Id, group?.page, this.pagination.limit)
        .subscribe({
          next: (res: any) => {
            if (res?.length > 0) {
              group.posts = [...group.posts, ...res];
            }
          },
        });
    }
  }

  createResearch(): void {
    this.formIsClicked.setValue(true);
    if (this.selectedVideoFile && !this.selectedImgFile) {
      this.toastService.danger('Please select image as thumbfile');
      return;
    }
    if (this.researchForm.invalid && this.formIsSubmitted.value === false) {
      this.toastService.danger('Please enter mandatory fields(*) data.');
      return;
    } else {
      this.formIsSubmitted.setValue(true);
      const reqObj = deleteExtraParamsFromReqObj(this.researchForm.value);
      const meta = { ...reqObj['meta'] };
      delete reqObj['meta'];
      reqObj['profileid'] = localStorage.getItem('profileId');
      reqObj['title'] = meta?.title;
      reqObj['metadescription'] = meta?.metadescription;
      reqObj['metaimage'] = meta?.metaimage;
      reqObj['metalink'] = meta?.metalink;
      reqObj['imageUrl'] = this.postImage;
      reqObj['pdfUrl'] = this.postFile;
      reqObj['streamname'] = this.postVideo;
      reqObj['thumbfilename'] = this.postThumbfilename;
      reqObj['posttype'] = 'R';
      this.socketService?.createOrEditPost(reqObj);
      this.toastService.success('Research added successfully.');
      this.resetPost();
    }
    this.removeImgFile();
    this.removePostSelectedFile();
  }

  isFormSubmittedAndError(
    controlName: string,
    errorName: string = '',
    notError: Array<string> = new Array()
  ): any {
    return isFormSubmittedAndError(
      this.researchForm,
      this.formIsClicked.value,
      controlName,
      errorName,
      notError
    );
  }

  createImagePost(): void {
    const profileId = localStorage.getItem('profileId');
    if (this.selectedImgFile && !this.selectedVideoFile) {
      this.uploadFilesService.uploadFile(this.selectedImgFile).subscribe({
        next: (res: any) => {
          if (res?.body?.url) {
            this.postImage = res?.body?.url;
            this.createResearch();
          }
        },
      });
    } else if (this.selectedpdfFile) {
      this.uploadFilesService.uploadFile(this.selectedpdfFile).subscribe({
        next: (res: any) => {
          if (res?.body?.url) {
            this.postFile = res?.body?.url;
            this.createResearch();
          }
        },
      });
    } else if (this.selectedVideoFile && this.selectedImgFile) {
      this.spinner.show();
      this.uploadFilesService.uploadFile(this.selectedImgFile).subscribe({
        next: (res: any) => {
          if (res?.body?.url) {
            this.postThumbfilename = res?.body?.url;
          }
        },
      });
      this.uploadFilesService.uploadFile(this.selectedVideoFile).subscribe({
        next: (res: any) => {
          if (res?.body?.url) {
            this.postVideo = res?.body?.url;
            this.spinner.hide();
            this.createResearch();
          }
        },
        error: (err) => {
          this.spinner.hide();
        },
      });
    } else {
      this.createResearch();
    }
  }

  onFileSelected(event: any) {
    const file = event.target?.files?.[0] || {};
    if (file) {
      this.postImageUrl = URL.createObjectURL(event.target.files[0]);
      this.selectedImgFile = file;
    }
    // if (file?.size < 5120000) {
    // } else {
    //   this.toastService.warring('Image is too large!');
    // }
  }

  removeImgFile(): void {
    this.selectedImgFile = null;
  }

  onPostFileSelect(event: any): void {
    const file = event.target?.files?.[0] || {};
    if (file) {
      this.postFileUrl = URL.createObjectURL(event.target.files[0]);
      this.selectedpdfFile = file;
    }
  }

  removePostSelectedFile(): void {
    this.selectedpdfFile = null;
  }

  resetPost(): void {
    this.researchForm.reset();
    this.researchForm.get('posttoprofileid').setValue('');
    this.tagInputDefaultData = 'reset';
    this.selectedImgFile = null;
    this.selectedpdfFile = null;
    this.selectedVideoFile = null;
    this.postVideoUrl = null;
    this.postVideo = null;
    this.postFile = null;
    this.postImage = null;
    setTimeout(() => {
      this.tagInputDefaultData = null;
    }, 100);
    Object.keys(this.researchForm.controls).forEach((key) => {
      this.researchForm.get(key).setErrors(null);
    });
    this.formIsClicked.setValue(false);
    this.formIsSubmitted.setValue(false);
  }

  onChangeTag(event) {
    // this.researchForm.get('keywords').setValue(event.target.value.replaceAll(' ', ','));
    this.researchForm
      .get('keywords')
      .setValue(
        event.target.value.replaceAll(' ', ',').replaceAll(/\s*,+\s*/g, ',')
      );
  }

  onSelectedVideo(event: any) {
    this.selectedVideoFile = event.target?.files?.[0];
    this.postVideoUrl = URL.createObjectURL(event.target.files[0]);
  }

  removeVideoSelectedFile(): void {
    this.selectedVideoFile = null;
    this.postVideoUrl = null;
  }
}
