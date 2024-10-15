import { Component, Input, OnInit } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-userguide-modal',
  templateUrl: './userguide-modal.component.html',
  styleUrls: ['./userguide-modal.component.scss'],
})
export class UserGuideModalComponent {
  constructor(public activeModal: NgbActiveModal) {}
}
