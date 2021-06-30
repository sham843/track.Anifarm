import { NgModule } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { OwlDateTimeModule, OwlNativeDateTimeModule } from 'ng-pick-datetime';
import { MaterialOrderRoutingModule } from './material-order-routing.module';
import { MaterialOrderComponent } from './material-order.component';
import {NgxPaginationModule} from 'ngx-pagination';
import { FormsModule ,ReactiveFormsModule }   from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';



@NgModule({
  declarations: [MaterialOrderComponent],
  imports: [
    CommonModule,
    MaterialOrderRoutingModule,
    NgxPaginationModule,
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule,
    OwlDateTimeModule, 
    OwlNativeDateTimeModule,
  ],
  providers:[DatePipe]
})
export class MaterialOrderModule { }
