import { AfterViewInit, Component, Input } from '@angular/core';
import { Router } from '@angular/router';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-research-card',
  templateUrl: './research-card.component.html',
  styleUrls: ['./research-card.component.scss']
})
export class ResearchCardComponent implements AfterViewInit {

  @Input('post') post: any;
  webUrl = environment.webUrl;

  constructor(
    private router: Router
  ) { 
  }
  
  ngAfterViewInit(): void {
  }

  openResearchPost(): void {
    // this.router.navigate(['/', 'research', 'post', this.post?.postID]);
    const id = this.post?.postID || this.post?.id
    this.router.navigate([`research/post/${id}`]);
  }
}
