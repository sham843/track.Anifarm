import { NgModule } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { AddressRoutingModule } from './address-routing.module';
import { AddressComponent } from './address.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgxPaginationModule } from 'ngx-pagination';
import { OwlDateTimeModule, OwlNativeDateTimeModule } from 'ng-pick-datetime';
import { NgxSelectModule } from 'ngx-select-ex';

@NgModule({
  declarations: [AddressComponent],
  imports: [
    CommonModule,
    AddressRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    NgxPaginationModule,
    OwlDateTimeModule, 
    OwlNativeDateTimeModule,
    NgxSelectModule
  ],
  providers: [DatePipe]
})
export class AddressModule { }
