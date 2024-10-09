import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
import { PostService } from 'src/app/@shared/services/post.service';
import { SeoService } from 'src/app/@shared/services/seo.service';
import { SharedService } from 'src/app/@shared/services/shared.service';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-research-post',
  templateUrl: './research-post.component.html',
  styleUrls: ['./research-post.component.scss']
})


export class ResearchPostComponent {
  postId: string = '';
  post: any = {};
  constructor(
    private spinner: NgxSpinnerService,
    private postService: PostService,
    public sharedService: SharedService,
    private route: ActivatedRoute,
    private seoService: SeoService,
  ) {
    this.postId = this.route.snapshot.paramMap.get('id');
  }

  ngOnInit(): void {
    if (this.postId) {
      this.getPostsByPostId();
    }
  }

  getPostsByPostId(): void {
    this.spinner.show();

    this.postService.getPostsByPostId(this.postId).subscribe(
      {
        next: (res: any) => {
          this.spinner.hide();
          if (res?.[0]) {
            this.post = res?.[0];
          }
        },
        error:
          (error) => {
            this.spinner.hide();
            console.log(error);
          }
      });
  }
}
