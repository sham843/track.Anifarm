import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { PoiRoutingModule } from './poi-routing.module';
import { PoiComponent } from './poi.component';
import { AgmCoreModule } from '@agm/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgxPaginationModule } from 'ngx-pagination';


@NgModule({
  declarations: [PoiComponent],
  imports: [
    CommonModule,
    PoiRoutingModule,
    AgmCoreModule,
    FormsModule,
    ReactiveFormsModule,
    NgxPaginationModule
  ]
})
export class PoiModule { }
