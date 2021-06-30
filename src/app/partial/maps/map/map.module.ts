import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { MapRoutingModule } from './map-routing.module';
import { MapComponent } from './map.component';
import { AgmCoreModule } from '@agm/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { AgmJsMarkerClustererModule } from '@agm/js-marker-clusterer';


@NgModule({
  declarations: [MapComponent],
  imports: [
    CommonModule,
    MapRoutingModule,
    AgmCoreModule,
    FormsModule,
    ReactiveFormsModule,
    AgmJsMarkerClustererModule
  ]
})
export class MapModule {
 }
