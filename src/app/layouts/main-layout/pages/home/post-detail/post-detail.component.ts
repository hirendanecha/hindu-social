import { isPlatformBrowser } from '@angular/common';
import {
  Component,
  Inject,
  OnInit,
  PLATFORM_ID,
} from '@angular/core';
import { Meta } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
import { PostService } from 'src/app/@shared/services/post.service';
import { SeoService } from 'src/app/@shared/services/seo.service';
import { SharedService } from 'src/app/@shared/services/shared.service';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-post-detail',
  templateUrl: './post-detail.component.html',
  styleUrls: ['./post-detail.component.scss'],
})
export class PostDetailComponent implements OnInit {
  post: any = {};

  constructor(
    private spinner: NgxSpinnerService,
    private postService: PostService,
    public sharedService: SharedService,
    private seoService: SeoService,
    private router: Router,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    this.router.events.subscribe((event: any) => {
      const id = event?.routerEvent?.url.split('/')[2];
      if (id) {
        this.getPostsByPostId(id);
      }
    });
  }

  ngOnInit(): void {

  }

  getPostsByPostId(id): void {
    this.spinner.show();

    this.postService.getPostsByPostId(id).subscribe(
      {
        next: (res: any) => {
          this.spinner.hide();
          if (res?.[0]) {
            this.post = res?.[0];
            const html = document.createElement('div');
            html.innerHTML =
              this.post?.postdescription || this.post?.metadescription;
            const data = {
              title: this.post?.title,
              url: `${environment.webUrl}post/${this.post?.id}`,
              description: html.textContent,
              image: this.post?.imageUrl,
              video: this.post?.streamname,
            };
            this.seoService.updateSeoMetaData(data);
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
