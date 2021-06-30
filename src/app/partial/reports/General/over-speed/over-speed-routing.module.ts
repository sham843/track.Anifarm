import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { OverSpeedComponent } from './over-speed.component';

const routes: Routes = [{ path: '', component: OverSpeedComponent }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class OverSpeedRoutingModule { }
