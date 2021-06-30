import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BreakDownRoutingModule } from './break-down-routing.module';
import { BreakDownComponent } from './break-down.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgxSelectModule } from 'ngx-select-ex';

@NgModule({
  declarations: [BreakDownComponent],
  imports: [
    CommonModule,
    BreakDownRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    NgxSelectModule
  ],
})
export class BreakDownModule { }
