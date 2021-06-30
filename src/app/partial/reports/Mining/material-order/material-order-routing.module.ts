import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { MaterialOrderComponent } from './material-order.component';

const routes: Routes = [{ path: '', component: MaterialOrderComponent }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class MaterialOrderRoutingModule { }
