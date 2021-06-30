import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EtpRoutingModule } from './etp-routing.module';
import { EtpComponent } from './etp.component';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { OwlDateTimeModule, OwlNativeDateTimeModule } from 'ng-pick-datetime';
import { NgxPaginationModule } from 'ngx-pagination';
import { NgxSelectModule } from 'ngx-select-ex';


@NgModule({
  declarations: [EtpComponent],
  imports: [
    CommonModule,
    EtpRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule,
    NgxPaginationModule,
    OwlDateTimeModule, 
    OwlNativeDateTimeModule,
    NgxSelectModule
  ]
})
export class EtpModule { }
