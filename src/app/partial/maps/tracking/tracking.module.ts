import { NgModule } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';

import { TrackingRoutingModule } from './tracking-routing.module';
import { TrackingComponent } from './tracking.component';
import { AgmCoreModule } from '@agm/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AgmDirectionModule } from 'agm-direction';
import { OwlDateTimeModule, OwlNativeDateTimeModule } from 'ng-pick-datetime';
import { NgxSelectModule } from 'ngx-select-ex';
@NgModule({
  declarations: [TrackingComponent],
  imports: [
    CommonModule,
    TrackingRoutingModule,
    FormsModule,ReactiveFormsModule,
    OwlDateTimeModule, 
    OwlNativeDateTimeModule,
    NgxSelectModule,
    AgmCoreModule.forRoot({
      apiKey: 'AIzaSyAV0MsCXcScyVTpfgelNpIakmESv9W0E3c',
      language: 'en',
      libraries: ['geometry','places']
    }),
    AgmDirectionModule
  ],
  providers:[DatePipe]
})
export class TrackingModule { }
