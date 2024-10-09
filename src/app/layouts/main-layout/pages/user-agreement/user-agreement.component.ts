import { Component } from '@angular/core';
import { SharedService } from '../../../../@shared/services/shared.service';
import { environment } from 'src/environments/environment';
import { SeoService } from 'src/app/@shared/services/seo.service';

@Component({
  selector: 'app-user-agreement',
  templateUrl: './user-agreement.component.html',
  styleUrls: ['./user-agreement.component.scss'],
})
export class UserAgreementComponent {
  constructor(public sharedService: SharedService, private seoService: SeoService) {
    const data = {
      title: 'Hindu.social User Agreement',
      url: `${environment.webUrl}user-agreement`,
      description: 'Agreement page',
      image: `${environment.webUrl}assets/images/landingpage/freedom-buzz.png`,
    };
    this.seoService.updateSeoMetaData(data);
  }
}
