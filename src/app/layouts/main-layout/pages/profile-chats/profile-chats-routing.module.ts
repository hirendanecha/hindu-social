import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ProfileChartsComponent } from './profile-chats.component';


const routes: Routes = [
  {
    path: '',
    component: ProfileChartsComponent,
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ProfileChatsRoutingModule { }
