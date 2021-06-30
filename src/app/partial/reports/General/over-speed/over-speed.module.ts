import { NgModule } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';

import { OverSpeedRoutingModule } from './over-speed-routing.module';
import { OverSpeedComponent } from './over-speed.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import {NgxPaginationModule} from 'ngx-pagination';
import { OwlDateTimeModule, OwlNativeDateTimeModule } from 'ng-pick-datetime';
import { NgxSelectModule } from 'ngx-select-ex';


@NgModule({
  declarations: [OverSpeedComponent],
  imports: [
    CommonModule,
    OverSpeedRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    NgxPaginationModule,
    OwlDateTimeModule, 
    OwlNativeDateTimeModule,
    NgxSelectModule
  ],
  providers:[DatePipe]
})
export class OverSpeedModule { }
