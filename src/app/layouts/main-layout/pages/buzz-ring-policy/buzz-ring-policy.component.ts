import { Component } from '@angular/core';
import { SharedService } from '../../../../@shared/services/shared.service';
import { environment } from 'src/environments/environment';
import { SeoService } from 'src/app/@shared/services/seo.service';

@Component({
  selector: 'app-buzzring-policy',
  templateUrl: './buzz-ring-policy.component.html',
  styleUrls: ['./buzz-ring-policy.component.scss'],
})
export class BuzzRingPolicyComponent {
  constructor(public sharedService: SharedService, private seoService: SeoService) {
    const data = {
      title: 'BuzzRing App Privacy Policy',
      url: `${environment.webUrl}buzzring-policy`,
      description: 'Hindu.social BuzzRing App Privacy Policy',
    };
    this.seoService.updateSeoMetaData(data);
  }
}
