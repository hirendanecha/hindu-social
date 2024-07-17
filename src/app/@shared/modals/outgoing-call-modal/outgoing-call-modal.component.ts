import {
  AfterViewInit,
  Component,
  Input,
  OnDestroy,
  OnInit,
} from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { SocketService } from '../../services/socket.service';
import { SoundControlService } from '../../services/sound-control.service';
import { Subscription } from 'rxjs';
import { Router } from '@angular/router';

@Component({
  selector: 'app-outgoing-call-modal',
  templateUrl: './outgoing-call-modal.component.html',
  styleUrls: ['./outgoing-call-modal.component.scss'],
})
export class OutGoingCallModalComponent
  implements OnInit, AfterViewInit, OnDestroy
{
  @Input() cancelButtonLabel: string = 'Hangup';
  @Input() confirmButtonLabel: string = 'Join';
  @Input() title: string = 'Outgoing call...';
  @Input() calldata: any;
  @Input() sound: any;

  hangUpTimeout: any;
  soundEnabledSubscription: Subscription;

  constructor(
    public activateModal: NgbActiveModal,
    private socketService: SocketService,
    private soundControlService: SoundControlService,
    private router: Router
  ) {}

  ngAfterViewInit(): void {
    const SoundOct = JSON.parse(
      localStorage.getItem('soundPreferences')
    )?.callSoundEnabled;
    if (SoundOct !== 'N') {
      if (this.sound) {
        this.sound?.play();
      }
    }
    if (window.document.hidden) {
      this.soundEnabledSubscription =
        this.soundControlService.soundEnabled$.subscribe((soundEnabled) => {
          console.log(soundEnabled);
          if (soundEnabled === false) {
            this.sound?.stop();
          }
        });
    }
    if (!this.hangUpTimeout) {
      this.hangUpTimeout = setTimeout(() => {
        this.hangUpCall('You have missed call');
        // this.activateModal.close('missCalled');
      }, 60000);
    }

    this.socketService.socket?.on('notification', (data: any) => {
      if (data?.actionType === 'DC') {
        this.sound?.stop();
        this.activateModal.close('cancel');
      } else if (data?.actionType === 'SC') {
        this.sound?.stop();
        this.activateModal.close('success');
      }
    });
  }

  ngOnInit(): void {
    this.socketService.socket?.on('notification', (data: any) => {
      if (data?.actionType === 'SC') {
        this.sound?.stop();
        this.activateModal.close('success');
      }
    });
  }

  pickUpCall(): void {
    this.sound?.stop();
    clearTimeout(this.hangUpTimeout);
    // this.router.navigate([`/appointment-call/${this.calldata.link}`]);
    const callId = this.calldata.link.replace('https://facetime.tube/', '');
    this.router.navigate([`/buzz-call/${callId}`]);
    // window.open(this.calldata.link, '_blank');
    this.activateModal.close('success');
  }

  hangUpCall(msg = ''): void {
    this.sound?.stop();
    clearTimeout(this.hangUpTimeout);
    const data = {
      notificationToProfileId: this.calldata.notificationToProfileId,
      roomId: this.calldata?.roomId,
      groupId: this.calldata?.groupId,
      notificationByProfileId: this.calldata.notificationByProfileId,
      message: msg || 'Call declined',
    };
    this.socketService?.hangUpCall(data, (data: any) => {
      return;
    });
    this.activateModal.close('missCalled');
  }

  ngOnDestroy(): void {
    this.soundEnabledSubscription?.unsubscribe();
  }
}
