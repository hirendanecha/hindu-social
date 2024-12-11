import { Injectable } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { NgxSpinnerService } from 'ngx-spinner';
import { CustomerService } from './customer.service';
import { CommunityService } from './community.service';
import { PostService } from './post.service';
import { ActivatedRoute } from '@angular/router';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { TokenStorageService } from './token-storage.service';
import { SocketService } from './socket.service';

@Injectable({
  providedIn: 'root',
})
export class SharedService {
  isDark = true;
  userData: any = {};
  notificationList: any = [];
  isNotify = false;
  linkMetaData: {};
  advertizementLink: any = [];
  onlineUserList: any = [];

  private isRoomCreatedSubject: BehaviorSubject<boolean> =
    new BehaviorSubject<boolean>(false);
  private bc = new BroadcastChannel('user_data_channel');
  loginUserInfo = new BehaviorSubject<any>(null);
  loggedInUser$ = this.loginUserInfo.asObservable();

  //trigger invite to chat modal
  public openModalSubject = new Subject<void>();
  openModal$ = this.openModalSubject.asObservable();

  private isNotifySubject = new BehaviorSubject<boolean>(false);

  // Expose as an observable
  isNotify$ = this.isNotifySubject.asObservable();

  callId: string;
  constructor(
    public modalService: NgbModal,
    private spinner: NgxSpinnerService,
    private customerService: CustomerService,
    private communityService: CommunityService,
    private postService: PostService,
    private route: ActivatedRoute,
    private tokenStorageService: TokenStorageService,
    private socketService: SocketService
  ) {
    this.route.paramMap.subscribe((paramMap) => {
      const name = paramMap.get('name');
      if (!name) {
        this.advertizementLink = [];
      }
    });
    if (localStorage.getItem('theme') === 'dark') {
      this.changeDarkUi();
    } else {
      this.changeLightUi();
    }
    this.bc.onmessage = (event) => {
      this.loginUserInfo.next(event.data);
    };
  }

  changeDarkUi() {
    this.isDark = true;
    document?.body.classList.remove('dark-ui');
    // document.body.classList.add('dark-ui');
    localStorage.setItem('theme', 'dark');
  }

  changeLightUi() {
    this.isDark = false;
    document?.body.classList.add('dark-ui');
    // document.body.classList.remove('dark-ui');
    localStorage.setItem('theme', 'light');
  }

  toggleUi(): void {
    if (this.isDark) {
      this.changeLightUi();
    } else {
      this.changeDarkUi();
    }
  }

  getUserDetails() {
    const profileId = localStorage.getItem('profileId');
    if (profileId) {
      this.spinner.show();
      this.customerService.getProfile(+profileId).subscribe({
        next: (res: any) => {
          this.spinner.hide();
          const data = res?.data?.[0];
          if (data) {
            this.userData = data;
            // localStorage.setItem('userData', JSON.stringify(this.userData));
            this.getLoginUserDetails(data);
            this.bc.postMessage(data);
          }
        },
        error: (error) => {
          this.spinner.hide();
          console.log(error);
        },
      });
    }
  }

  isUserMediaApproved(): boolean {
    return this.userData?.MediaApproved === 1;
  }

  getNotificationList() {
    const id = localStorage.getItem('profileId');
    const data = {
      page: 1,
      size: 20,
    };
    this.customerService.getNotificationList(Number(id), data).subscribe({
      next: (res: any) => {
        this.isNotify = false;
        this.notificationList = res.data.filter((ele) => {
          ele.notificationToProfileId === id;
          return ele;
        });
        // this.notificationList = res?.data;
      },
      error: (error) => {
        console.log(error);
      },
    });
  }

  getAdvertizeMentLink(id): void {
    if (id) {
      this.communityService.getLinkById(id).subscribe({
        next: (res: any) => {
          if (res.data) {
            if (res.data[0]?.link1 || res.data[0]?.link2) {
              this.advertizementLink = [];
              if (res.data[0]?.link1) {
                this.getMetaDataFromUrlStr(res.data[0]?.link1);
              }
              if (res.data[0]?.link2) {
                this.getMetaDataFromUrlStr(res.data[0]?.link2);
              }
            }
          }
        },
        error: (err) => {
          console.log(err);
        },
      });
    } else {
      this.advertizementLink = null;
    }
  }

  getMetaDataFromUrlStr(url): void {
    this.postService.getMetaData({ url }).subscribe({
      next: (res: any) => {
        const meta = res?.meta;
        const urls = meta?.image?.url;
        const imgUrl = Array.isArray(urls) ? urls?.[0] : urls;
        const linkMetaData = {
          title: meta?.title,
          metadescription: meta?.description,
          metaimage: imgUrl,
          metalink: meta?.url || url,
          url: url,
        };
        this.advertizementLink.push(linkMetaData);
      },
      error: (err) => {
        console.log(err);
      },
    });
  }

  updateIsRoomCreated(value: boolean): void {
    this.isRoomCreatedSubject.next(value);
  }

  // Method to get an Observable that emits isRoomCreated changes
  getIsRoomCreatedObservable(): Observable<boolean> {
    return this.isRoomCreatedSubject.asObservable();
  }

  getLoginUserDetails(userData: any = {}) {
    this.loginUserInfo.next(userData);
  }

  generateSessionKey(): void {
    const sessionKey =
      Math.random().toString(36).substring(2) + Date.now().toString(36);
    sessionStorage.setItem('uniqueSessionKey', sessionKey);
  }

  isCorrectBrowserSession(): boolean {
    const sessionKey = sessionStorage.getItem('uniqueSessionKey');
    if (sessionKey) {
      sessionStorage.removeItem('uniqueSessionKey');
      return true;
    }
    return false;
  }

  logOut(): void {
    this.socketService?.socket?.emit('offline', (data) => {
      return;
    });
    this.socketService?.socket?.on('get-users', (data) => {
      data.map((ele) => {
        if (!this.onlineUserList.includes(ele.userId)) {
          this.onlineUserList.push(ele.userId);
        }
      });
      // this.onlineUserList = data;
    });
    this.customerService.logout().subscribe({
      next: (res) => {
        this.tokenStorageService.clearLoginSession(this.userData.profileId);
        this.tokenStorageService.signOut();
        return;
      },
      error: (err) => {
        if (err.status === 401) {
          this.tokenStorageService.signOut();
        }
      },
    });
  }

  triggerOpenModal() {
    this.openModalSubject.next();
  }

  setNotify(value: boolean): void {
    this.isNotifySubject.next(value);
  }

  // Method to get the current value
  getNotify(): boolean {
    return this.isNotifySubject.getValue();
  }
}
