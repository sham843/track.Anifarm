import { NgModule } from '@angular/core';
import { CommonModule, DatePipe, DecimalPipe } from '@angular/common';
import { RechargeRoutingModule } from './recharge-routing.module';
import { RechargeComponent } from './recharge.component';
import { NgxPaginationModule } from 'ngx-pagination';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { PaymentReceiptComponent } from './payment-receipt/payment-receipt.component';
import { OwlDateTimeModule, OwlNativeDateTimeModule } from 'ng-pick-datetime';
import { TooltipDirective } from './tooltip.directive';




@NgModule({
  declarations: [RechargeComponent, PaymentReceiptComponent, TooltipDirective],
  imports: [
    CommonModule,
    RechargeRoutingModule,
    NgxPaginationModule,
    FormsModule,
    ReactiveFormsModule,
    OwlDateTimeModule, 
    OwlNativeDateTimeModule,
  ],
  providers:[DecimalPipe]
})
export class RechargeModule { }
