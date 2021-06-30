import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SpeedRangeComponent } from './speed-range.component';

const routes: Routes = [{ path: '', component: SpeedRangeComponent }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class SpeedRangeRoutingModule { }
