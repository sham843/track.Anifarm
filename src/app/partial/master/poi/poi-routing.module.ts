import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PoiComponent } from './poi.component';

const routes: Routes = [{ path: '', component: PoiComponent }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PoiRoutingModule { }
