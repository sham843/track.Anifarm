import { NgModule } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { SpeedRangeRoutingModule } from './speed-range-routing.module';
import { SpeedRangeComponent } from './speed-range.component';
import {NgxPaginationModule} from 'ngx-pagination';
import { FormsModule ,ReactiveFormsModule }   from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { OwlDateTimeModule, OwlNativeDateTimeModule } from 'ng-pick-datetime';
import { NgxSelectModule } from 'ngx-select-ex';


@NgModule({
  declarations: [SpeedRangeComponent],
  imports: [
    CommonModule,
    SpeedRangeRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule,
    NgxPaginationModule,
    OwlDateTimeModule, 
    OwlNativeDateTimeModule,
    NgxSelectModule
  ],
  providers: [DatePipe]
})
export class SpeedRangeModule { }
