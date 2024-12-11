import {
  AfterViewInit,
  Component,
  ElementRef,
  Input,
  OnDestroy,
  OnInit,
  ViewChild,
} from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { SocketService } from '../../services/socket.service';
import { SoundControlService } from '../../services/sound-control.service';
import { Subscription } from 'rxjs';
import { Router } from '@angular/router';
import { SharedService } from '../../services/shared.service';

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
  @ViewChild('focusElement') focusElement!: ElementRef;

  hangUpTimeout: any;
  soundEnabledSubscription: Subscription;
  soundTrigger: string;

  constructor(
    public activateModal: NgbActiveModal,
    private socketService: SocketService,
    private soundControlService: SoundControlService,
    private router: Router,
    private sharedService: SharedService
  ) {}

  ngAfterViewInit(): void {
    // const SoundOct = JSON.parse(
    //   localStorage.getItem('soundPreferences')
    // )?.callSoundEnabled;
    // if (SoundOct !== 'N') {
    //   if (this.sound) {
    //     this.sound?.play();
    //   }
    // }
    this.sharedService.loginUserInfo.subscribe((user) => {
      this.soundTrigger = user.callNotificationSound;
    });
    if (this.soundTrigger === 'Y' && this.calldata.link) {
      if (this.sound) {
        this.sound?.play();
      }
    }
    if (window.document.hidden) {
      this.soundEnabledSubscription =
        this.soundControlService.soundEnabled$.subscribe((soundEnabled) => {
          if (soundEnabled === false) {
            this.sound?.stop();
          }
        });
    }
    if (!this.hangUpTimeout) {
      this.hangUpTimeout = setTimeout(() => {
        this.hangUpCall('Missed call');
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
    if (this.focusElement) {
      this.focusElement.nativeElement.click();
    }
  }

  ngOnInit(): void {
    this.sharedService.generateSessionKey();
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
    this.router.navigate([`/facetime/${callId}`]);
    // window.open(this.calldata.link, '_blank');
    this.activateModal.close('success');
  }

  hangUpCall(msg = ''): void {
    this.sound?.stop();
    clearTimeout(this.hangUpTimeout);
    const data = {
      notificationToProfileId: this.calldata?.notificationToProfileId,
      roomId: this.calldata?.roomId,
      groupId: this.calldata?.groupId,
      notificationByProfileId: this.calldata?.notificationByProfileId,
      message: msg || 'Missed call',
    };
    this.socketService?.hangUpCall(data, (data: any) => {
      return;
    });
    this.activateModal.close('missCalled');
  }

  ngOnDestroy(): void {
    this.soundEnabledSubscription?.unsubscribe();
    this.calldata = null;
    this.sound = null;
  }
}
