import { NgModule } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { PaymentHistoryRoutingModule } from './payment-history-routing.module';
import { PaymentHistoryComponent } from './payment-history.component';
import { NgxPaginationModule } from 'ngx-pagination';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { OwlDateTimeModule, OwlNativeDateTimeModule } from 'ng-pick-datetime';



@NgModule({
  declarations: [PaymentHistoryComponent],
  imports: [
    CommonModule,
    PaymentHistoryRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    NgxPaginationModule,
    OwlDateTimeModule,
    OwlNativeDateTimeModule,
  ],
  providers: [DatePipe]
})
export class PaymentHistoryModule { }
