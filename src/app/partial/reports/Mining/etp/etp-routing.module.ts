import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { EtpComponent } from './etp.component';

const routes: Routes = [{ path: '', component: EtpComponent }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class EtpRoutingModule { }
