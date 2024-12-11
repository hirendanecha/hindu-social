import {
  AfterViewInit,
  Component,
  Input,
  OnInit,
  afterNextRender,
} from '@angular/core';
import { PostService } from '../../services/post.service';
import { environment } from 'src/environments/environment';
import { NgxSpinnerService } from 'ngx-spinner';
import { TokenStorageService } from '../../services/token-storage.service';
import { BreakpointService } from '../../services/breakpoint.service';
import { Router } from '@angular/router';

declare var jwplayer: any;
@Component({
  selector: 'app-re-post-card',
  templateUrl: './re-post-card.component.html',
  styleUrls: ['./re-post-card.component.scss'],
})
export class RePostCardComponent implements AfterViewInit, OnInit {
  @Input('id') id: any = {};

  descriptionimageUrl: string;
  post: any = {};

  webUrl = environment.webUrl;
  tubeUrl = environment.tubeUrl;

  sharedPost: string;
  player: any;
  showHoverBox = false;
  profileId = '';

  isCommentsLoader: boolean = false;
  editCommentsLoader: boolean = false;
  isOpenCommentsPostId: number = null;
  commentDescriptionimageUrl: string;
  replayCommentDescriptionimageUrl: string;
  commentList: any = [];
  replyCommentList: any = [];
  isReply = false;
  parentReplayComment: boolean = false;
  showFullDesc: boolean = false;

  constructor(
    private postService: PostService,
    private spinner: NgxSpinnerService,
    public tokenService: TokenStorageService,
    public breakpointService: BreakpointService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.getPostById();
  }

  ngAfterViewInit(): void {}

  getPostById(): void {
    this.spinner.show();
    this.postService.getPostsByPostId(this.id).subscribe({
      next: (res: any) => {
        this.spinner.hide();
        this.post = res[0];
        this.viewComments(this.id);
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

  selectMessaging(data) {
    const userData = {
      Id: data.profileid,
      ProfilePicName: data.ProfilePicName,
      Username: data.Username,
    };
    const encodedUserData = encodeURIComponent(JSON.stringify(userData));
    const url = this.router
      .createUrlTree(['/profile-chats'], {
        queryParams: { chatUserData: encodedUserData },
      })
      .toString();
    // window.open(url, '_blank');
    this.router.navigateByUrl(url);
  }

  opyData(post): string {
    return `<a href="/settings/view-profile/${
      post.profileid || post.profileId
    }" class="text-danger" data-id="${post.profileid || post.profileId}">@${
      post.Username
    }</a>`;
  }

  viewComments(id: number): void {
    if (this.post.id === id) {
      this.editCommentsLoader = true;
      this.isOpenCommentsPostId = id;
      this.isCommentsLoader = true;
      const data = {
        postId: id,
        profileId: this.profileId,
      };
      this.postService.getComments(data).subscribe({
        next: (res) => {
          if (res) {
            this.post.commentCount = res.data?.count;
            res.data.commmentsList.filter((ele: any) => {
              ele.descImg = this.extractImageUrlFromContent(ele.comment);
            });
            this.commentList = res.data.commmentsList.map((ele: any) => ({
              ...ele,
              replyCommnetsList: res.data.replyCommnetsList.filter(
                (ele1: any) => {
                  ele1.descImg = this.extractImageUrlFromContent(ele1.comment);
                  return ele.id === ele1.parentCommentId;
                }
              ),
            }));
            this.editCommentsLoader = false;

            this.commentList.forEach((element) => {
              this.commentDescriptionimageUrl = this.extractImageUrlFromContent(
                element.comment
              );
            });

            this.commentList.forEach((element) => {
              element.replyCommnetsList.forEach((ele) => {
                this.replayCommentDescriptionimageUrl =
                  this.extractImageUrlFromContent(ele.comment);
              });
            });
          }
        },
        error: (error) => {
          console.log(error);
          this.editCommentsLoader = false;
        },
        complete: () => {
          this.isCommentsLoader = false;
          this.editCommentsLoader = false;
        },
      });
    }
  }

  extractImageUrlFromContent(content: string): string | null {
    const contentContainer = document.createElement('div');
    contentContainer.innerHTML = content;
    const imgTag = contentContainer.querySelector('img');

    if (imgTag) {
      const imgTitle = imgTag.getAttribute('title');
      const imgStyle = imgTag.getAttribute('style');
      const imageGif = imgTag
        .getAttribute('src')
        .toLowerCase()
        .endsWith('.gif');
      if (!imgTitle && !imgStyle && !imageGif) {
        return imgTag.getAttribute('src');
      }
    }
    return null;
  }

  showFullDescription() {
    this.showFullDesc = !this.showFullDesc;
  }
}
