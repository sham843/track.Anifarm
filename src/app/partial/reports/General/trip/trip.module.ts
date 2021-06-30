import { NgModule } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { OwlDateTimeModule, OwlNativeDateTimeModule } from 'ng-pick-datetime';
import { TripRoutingModule } from './trip-routing.module';
import { TripComponent } from './trip.component';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgxPaginationModule } from 'ngx-pagination';
import { NgxSelectModule } from 'ngx-select-ex';


@NgModule({
  declarations: [TripComponent],
  imports: [
    CommonModule,
    TripRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    NgxPaginationModule,
    HttpClientModule,
    OwlDateTimeModule, 
    OwlNativeDateTimeModule,
    NgxSelectModule
  ],
  providers: [DatePipe]
})
export class TripModule { }
