import { NgModule } from '@angular/core';
import { CommonModule, IMAGE_CONFIG } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ConfirmationModalComponent } from './modals/confirmation-modal/confirmation-modal.component';
import { NgxSpinnerModule } from 'ngx-spinner';
import { RouterModule } from '@angular/router';
import { PostListComponent } from './components/post-list/post-list.component';
import { PostCardComponent } from './components/post-card/post-card.component';
import { ImgPickerComponent } from './components/img-picker/img-picker.component';
import { CommunityCardComponent } from './components/community-card/community-card.component';
import { RightSidebarComponent } from '../layouts/main-layout/components/right-sidebar/right-sidebar.component';
import { PostMetaDataCardComponent } from './components/post-meta-data-card/post-meta-data-card.component';
import { NgxTrimDirectiveModule } from 'ngx-trim-directive';
import { TagUserInputComponent } from './components/tag-user-input/tag-user-input.component';
import { ImgPreviewComponent } from './components/img-preview/img-preview.component';
import { InlineLoaderComponent } from './components/inline-loader/inline-loader.component';
import { LAZYLOAD_IMAGE_HOOKS, ScrollHooks } from 'ng-lazyload-image';
import { CopyClipboardDirective } from './directives/copy-clipboard.directive';
import {
  FontAwesomeModule,
  FaIconLibrary,
} from '@fortawesome/angular-fontawesome';
import {
  faAngleDoubleUp,
  faCamera,
  faEye,
  faXmark,
  faBars,
  faBorderAll,
  faChevronDown,
  faChevronUp,
  faChevronRight,
  faCirclePlus,
  faMagnifyingGlass,
  faDownload,
  faUser,
  faCalendarDays,
  faClock,
  faMessage,
  faThumbsUp,
  faRotate,
  faTrashCan,
  faEllipsis,
  faUserMinus,
  faPenToSquare,
  faLink,
  faComment,
  faImage,
  faPaperPlane,
  faBell,
  faHouse,
  faBookOpen,
  faPlay,
  faNetworkWired,
  faLayerGroup,
  faCertificate,
  faGear,
  faUserPlus,
  faUserXmark,
  faRightFromBracket,
  faUnlockKeyhole,
  faSun,
  faMoon,
  faPlus,
  faSatelliteDish,
  faVideo,
  faUserCheck,
  faCheck,
  faSquareCheck,
  faSquareXmark,
  faUpload,
  faFileUpload,
  faFile,
  faFilePdf,
  faShareNodes,
  faShare,
  faEnvelope,
  faPaperclip,
  faPhone,
  faEllipsisH,
  faSearch,
  faBan,
  faFileVideo,
  faSliders,
  faCopy,
  faPhoneSlash,
  faEllipsisV,
  faUsers,
  faCommentAlt,
  faPencil,
  faRefresh,
  faReply,
  faUserTimes,
  faPhotoFilm,
  faRepeat,
  faMobile,
  faEyeSlash,
  faTicketAlt,
  faSquarePlus,
  faTableList,
  faChevronLeft,
  faPhoneFlip,
  faVoicemail,
  faPhoneVolume,
  faCircleChevronUp,
  faCircleChevronDown,
  faSignIn,
  faSignOut,
  faHouseMedical,
  faArrowLeftLong,
  faArrowRightLong,
  faCircle,
  faGlobe,
  faList,
  faStethoscope,
} from '@fortawesome/free-solid-svg-icons';
import { ClaimTokenModalComponent } from './modals/clai-1776-token-modal/claim-token-modal.component';
import { WalletLinkComponent } from './modals/wallet-download-modal/1776-wallet.component';
import { ReplyCommentModalComponent } from './modals/reply-comment-modal/reply-comment-modal.component';
import { PipeModule } from './pipe/pipe.module';
import { VideoPostModalComponent } from './modals/video-post-modal/video-post-modal.component';
import { ForgotPasswordComponent } from '../layouts/auth-layout/pages/forgot-password/forgot-password.component';
import { MentionModule } from 'angular-mentions';
//import { PdfViewerModule } from 'ng2-pdf-viewer';
import { PdfPreviewComponent } from './components/pdf-preview/pdf-preview.component';
import {
  NgbActiveModal,
  NgbActiveOffcanvas,
  NgbCollapseModule,
  NgbDropdownModule,
  NgbModule,
  NgbNavModule,
} from '@ng-bootstrap/ng-bootstrap';
import { PostDetailComponent } from '../layouts/main-layout/pages/home/post-detail/post-detail.component';
import { EditResearchModalComponent } from './modals/edit-research-modal/edit-research-modal.component';
import { SharePostModalComponent } from './modals/share-post-modal/share-post-modal.component';
import { RePostCardComponent } from './components/re-post-card/re-post-card.component';
import { EditPostModalComponent } from './modals/edit-post-modal/edit-post-modal.component';
import { ConferenceLinkComponent } from './modals/create-conference-link/conference-link-modal.component';
import { IncomingcallModalComponent } from './modals/incoming-call-modal/incoming-call-modal.component';
import { OutGoingCallModalComponent } from './modals/outgoing-call-modal/outgoing-call-modal.component';
import { CreateGroupModalComponent } from './modals/create-group-modal/create-group-modal.component';
import { EditGroupModalComponent } from './modals/edit-group-modal/edit-group-modal.component';
import { MediaGalleryComponent } from './components/media-gallery/media-gallery.component';
import { GalleryImgPreviewComponent } from './components/gallery-img-preview/gallery-img-preview.component';
import { QRCodeModule } from 'angularx-qrcode';
import { QrScanModalComponent } from './modals/qrscan-modal/qrscan-modal.component';
import { AppQrModalComponent } from './modals/app-qr-modal/app-qr-modal.component';
import { ForwardChatModalComponent } from './modals/forward-chat-modal/forward-chat-modal.component';
import { ImgLayoutComponent } from './components/img-layout/img-layout.component';
import { HoverDropdownDirective } from './directives/hover-dropdown.directive';
import { UserGuideModalComponent } from './modals/userguide-modal/userguide-modal.component';
import { InvitePeopleForChatModalComponent } from './modals/invite-people-for-chat/invite-people-for-chat-modal.component';
import { HealthPraatitionerCardComponent } from './components/health-partitioner-card/health-partitioner-card.component';
import { OpenStripeComponent } from './modals/open-stripe/open-stripe.component';
import { AppointmentModalComponent } from './modals/appointment-modal/appointment-modal.component';

const sharedComponents = [
  ConfirmationModalComponent,
  PostListComponent,
  PostCardComponent,
  ImgPickerComponent,
  CommunityCardComponent,
  RightSidebarComponent,
  PostMetaDataCardComponent,
  TagUserInputComponent,
  ImgPreviewComponent,
  InlineLoaderComponent,
  CopyClipboardDirective,
  HoverDropdownDirective,
  ClaimTokenModalComponent,
  WalletLinkComponent,
  ReplyCommentModalComponent,
  VideoPostModalComponent,
  ForgotPasswordComponent,
  PdfPreviewComponent,
  PostDetailComponent,
  EditResearchModalComponent,
  SharePostModalComponent,
  RePostCardComponent,
  HealthPraatitionerCardComponent,
  EditPostModalComponent,
  ConferenceLinkComponent,
  IncomingcallModalComponent,
  OutGoingCallModalComponent,
  CreateGroupModalComponent,
  EditGroupModalComponent,
  MediaGalleryComponent,
  GalleryImgPreviewComponent,
  QrScanModalComponent,
  AppQrModalComponent,
  ForwardChatModalComponent,
  ImgLayoutComponent,
  AppointmentModalComponent,
  OpenStripeComponent,
  UserGuideModalComponent,
  InvitePeopleForChatModalComponent,
];

const sharedModules = [
  CommonModule,
  FormsModule,
  ReactiveFormsModule,
  NgbDropdownModule,
  NgbNavModule,
  NgbCollapseModule,
  NgbModule,
  NgxSpinnerModule,
  RouterModule,
  NgxTrimDirectiveModule,
  FontAwesomeModule,
  PipeModule,
  MentionModule,
  QRCodeModule,
];

@NgModule({
  imports: [sharedModules],
  declarations: [sharedComponents],
  exports: [...sharedModules, ...sharedComponents],
  providers: [
    NgbActiveModal,
    NgbActiveOffcanvas,
    { provide: LAZYLOAD_IMAGE_HOOKS, useClass: ScrollHooks },
    {
      provide: IMAGE_CONFIG,
      useValue: {
        disableImageSizeWarning: true, 
        disableImageLazyLoadWarning: true
      }
    },
  ],
})
export class SharedModule {
  constructor(library: FaIconLibrary) {
    library.addIcons(
      faAngleDoubleUp,
      faCamera,
      faEye,
      faXmark,
      faBars,
      faBorderAll,
      faChevronDown,
      faChevronUp,
      faChevronRight,
      faCirclePlus,
      faMagnifyingGlass,
      faDownload,
      faUser,
      faCalendarDays,
      faClock,
      faMessage,
      faThumbsUp,
      faRotate,
      faTrashCan,
      faEllipsis,
      faUserMinus,
      faPenToSquare,
      faLink,
      faComment,
      faImage,
      faPaperPlane,
      faBell,
      faHouse,
      faBookOpen,
      faPlay,
      faNetworkWired,
      faLayerGroup,
      faCertificate,
      faGear,
      faUserPlus,
      faUserXmark,
      faRightFromBracket,
      faUnlockKeyhole,
      faSun,
      faMoon,
      faPlus,
      faSatelliteDish,
      faVideo,
      faUserCheck,
      faCheck,
      faSquareCheck,
      faSquareXmark,
      faFileUpload,
      faFile,
      faFilePdf,
      faDownload,
      faShare,
      faHouseMedical,
      faStethoscope,
      faArrowLeftLong,
      faArrowRightLong,
      faGlobe,
      faList,
      faCircle,
      faEnvelope,
      faPaperclip,
      faPhone,
      faEllipsisH,
      faSearch,
      faBan,
      faFileVideo,
      faSliders,
      faCopy,
      faPhoneSlash,
      faEllipsisV,
      faUsers,
      faCommentAlt,
      faLayerGroup,
      faGear,
      faPencil,
      faRefresh,
      faRightFromBracket,
      faReply,
      faUserTimes,
      faPhotoFilm,
      faRepeat,
      faMobile,
      faEye,
      faEyeSlash,
      faTicketAlt,
      faPhotoFilm,
      faCopy,
      faSquarePlus,
      faTableList,
      faChevronLeft,
      faPhoneFlip,
      faVoicemail,
      faPhoneVolume,
      faCircleChevronUp,
      faCircleChevronDown,
      faSignIn,
      faSignOut
    );
  }
}
