import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { BreakDownComponent } from './break-down.component';

const routes: Routes = [{ path: '', component: BreakDownComponent }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class BreakDownRoutingModule { }
