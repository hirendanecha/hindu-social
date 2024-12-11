import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
import { ProfileService } from 'src/app/@shared/services/profile.service';
import { SeoService } from 'src/app/@shared/services/seo.service';
import { TokenStorageService } from 'src/app/@shared/services/token-storage.service';

@Component({
  selector: 'app-research-details',
  templateUrl: './research-details.component.html',
  styleUrls: ['./research-details.component.scss'],
})
export class ResearchDetailsComponent {
  groupDetails: any = {};
  posts: any = [];
  resources: any = [];
  isLoadMorePosts: boolean = true;
  pagination: any = {
    page: 1,
    limit: 12,
  };
  profileId: number;
  membersIds = [];
  constructor(
    private profileService: ProfileService,
    private spinner: NgxSpinnerService,
    private route: ActivatedRoute,
    private seoService: SeoService,
    public tokenService: TokenStorageService
  ) {
    this.GetGroupBasicDetails();
    this.profileId = +localStorage.getItem('profileId');
  }

  GetGroupBasicDetails(): void {
    this.spinner.show();
    // const uniqueLink = this.route.snapshot.paramMap.get('uniqueLink');
    this.route.paramMap.subscribe((param: any) => {
      const uniqueLink = param.get('uniqueLink');
      this.profileService.getGroupBasicDetails(uniqueLink).subscribe({
        next: (res: any) => {
          if (res?.ID) {
            this.groupDetails = res;
            if (this.groupDetails?.groupMembersList?.length >= 0) {
              this.membersIds = this.groupDetails?.groupMembersList?.map(
                (member: any) => member?.profileId
              );
            }
            const data = {
              title: `Freedom.Buzz Research ${this.groupDetails?.PageTitle}`,
              url: `${location.href}`,
              description: this.groupDetails?.PageDescription,
              image:
                this.groupDetails?.CoverPicName ||
                this.groupDetails?.ProfilePicName,
            };
            this.seoService.updateSeoMetaData(data);
            this.GetGroupPostById();
          }
          this.spinner.hide();
        },
        error: () => {
          this.spinner.hide();
        },
      });
    });
  }

  GetGroupPostById(): void {
    this.spinner.show();

    this.profileService
      .getGroupPostById(
        this.groupDetails?.ID,
        this.pagination?.page,
        this.pagination?.limit
      )
      .subscribe({
        next: (res: any) => {
          if (res?.length > 0) {
            this.posts = [...this.posts, ...res];
            this.isLoadMorePosts = res?.length === this.pagination?.limit;
          }
          this.spinner.hide();
        },
        error: () => {
          this.spinner.hide();
        },
      });
  }

  GetGroupFileResourcesById(id: string): void {
    this.spinner.show();

    this.profileService.getGroupFileResourcesById(id).subscribe({
      next: (res: any) => {
        if (res?.length > 0) {
          this.resources = res;
        }
        this.spinner.hide();
      },
      error: () => {
        this.spinner.hide();
      },
    });
  }

  loadMorePosts(): void {
    this.pagination.page += 1;
    this.GetGroupPostById();
  }

  joinResearchGroup(): void {
    this.spinner.show();
    const data = {
      researchProfileId: this.groupDetails?.ID,
      profileId: this.profileId,
    };

    this.profileService.joinGroup(data).subscribe({
      next: (res: any) => {
        if (res) {
          this.spinner.hide();
          this.GetGroupBasicDetails();
        }
      },
      error: (err) => {
        console.log(err);
        this.spinner.hide();
      },
    });
  }

  leaveResearchGroup(): void {
    this.spinner.show();
    const data = {
      researchProfileId: this.groupDetails?.ID,
      profileId: this.profileId,
    };

    this.profileService.leaveGroup(data).subscribe({
      next: (res: any) => {
        if (res) {
          this.spinner.hide();
          this.GetGroupBasicDetails();
        }
      },
      error: (err) => {
        console.log(err);
        this.spinner.hide();
      },
    });
  }
}
