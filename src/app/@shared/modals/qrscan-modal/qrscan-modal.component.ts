import { Component, Input } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-qrscan-modal',
  templateUrl: './qrscan-modal.component.html',
  styleUrls: ['./qrscan-modal.component.scss'],
})
export class QrScanModalComponent {
  @Input() store: string;
  @Input() image: string;

  constructor(public activeModal: NgbActiveModal) {}
}
