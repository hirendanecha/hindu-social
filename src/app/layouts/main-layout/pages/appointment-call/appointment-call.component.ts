import { Component } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-appointment-call',
  templateUrl: './appointment-call.component.html',
  styleUrls: ['./appointment-call.component.scss'],
})
export class AppointmentCallComponent {
  appointmentCall: any;

  constructor(private route: ActivatedRoute, private sanitizer: DomSanitizer) {
    const appointmentURLCall =
      this.route.snapshot['_routerState'].url.split('/appointment-call/')[1];
    this.appointmentCall = this.sanitizer.bypassSecurityTrustResourceUrl(
      'https://facetime.tube/' + appointmentURLCall
    );
  }
}
