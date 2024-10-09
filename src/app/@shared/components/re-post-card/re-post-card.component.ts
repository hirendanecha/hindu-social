import { Component, Input, OnInit } from '@angular/core';
import { PostService } from '../../services/post.service';
import { environment } from 'src/environments/environment';
import { NgxSpinnerService } from 'ngx-spinner';

@Component({
  selector: 'app-re-post-card',
  templateUrl: './re-post-card.component.html',
  styleUrls: ['./re-post-card.component.scss'],
})
export class RePostCardComponent implements OnInit {
  @Input('id') id: any = {};

  descriptionimageUrl: string;
  post: any = {};

  webUrl = environment.webUrl;
  tubeUrl = environment.tubeUrl;

  sharedPost: string
  player: any

  constructor(private postService: PostService,
    private spinner: NgxSpinnerService) {
  }

  ngOnInit(): void {
    this.getPostById();
  }

  getPostById(): void {
    this.spinner.show();
    this.postService.getPostsByPostId(this.id).subscribe({
      next: (res: any) => {
        this.spinner.hide();
        this.post = res[0];
      },
      error: (err) => {
        this.spinner.hide();
        console.log(err);
      },
    });
  }

  redirectToParentProfile(post) {
    if (this.post.streamname) {
      this.sharedPost = this.tubeUrl + 'video/' + post.id;
    } else {
      this.sharedPost = this.webUrl + 'post/' + post.id;
    }
    const url = this.sharedPost;
    window.open(url, '_blank');
  }
}
