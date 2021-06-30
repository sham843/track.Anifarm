import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PaymentHistoryComponent } from './payment-history.component';

const routes: Routes = [{ path: '', component: PaymentHistoryComponent }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PaymentHistoryRoutingModule { }
