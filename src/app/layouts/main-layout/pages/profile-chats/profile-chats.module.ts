import { NgModule } from '@angular/core';
import { ProfileChartsComponent } from './profile-chats.component';
import { SharedModule } from 'src/app/@shared/shared.module';
import { ProfileChatsRoutingModule } from './profile-chats-routing.module';
import { ProfileChatsSidebarComponent } from './profile-chats-sidebar/profile-chats-sidebar.component';
import { ProfileChatsListComponent } from './profile-chats-list/profile-chats-list.component';
import { AppointmentCallComponent } from 'src/app/@shared/components/appointment-call/appointment-call.component';


@NgModule({
  declarations: [
    ProfileChartsComponent, 
    ProfileChatsSidebarComponent, 
    ProfileChatsListComponent,
    AppointmentCallComponent
  ],
  imports: [SharedModule, ProfileChatsRoutingModule]
})
export class ProfileChartsModule { }
