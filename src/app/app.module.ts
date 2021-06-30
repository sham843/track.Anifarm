import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { PageNotFoundComponent } from './errors/page-not-found/page-not-found.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NgxSpinnerModule } from 'ngx-spinner';
import { AuthGuard } from './auth/auth.guard';
import { AuthService } from './auth/auth.service';
import { Layout1Component } from './web/layout1/layout1.component';
import { Header1Component } from './web/layout1/header1/header1.component';
import { Footer1Component } from './web/layout1/footer1/footer1.component';
import { Layout2Component } from './partial/layout2/layout2.component';
import { Header2Component } from './partial/layout2/header2/header2.component';
import { AccessDeniedComponent } from './errors/access-denied/access-denied.component';
import { AgmCoreModule } from '@agm/core';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { ToastrModule } from 'ngx-toastr';
import { DatePipe, DecimalPipe} from '@angular/common';
import { GeneratePasswordComponent } from './web/generate-password/generate-password.component';
import { ReactiveFormsModule } from '@angular/forms';


@NgModule({
  declarations: [
    AppComponent,
    PageNotFoundComponent,
    GeneratePasswordComponent,
    Layout1Component,
    Header1Component,
    Footer1Component,
    Layout2Component,
    Header2Component,
    AccessDeniedComponent,
  ],

  imports: [
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    NgxSpinnerModule,
    HttpClientModule,
    ReactiveFormsModule,
    ToastrModule.forRoot({
        timeOut: 2000,
        closeButton: true,
        progressBar:true,
        preventDuplicates: true,
      }),
    AgmCoreModule.forRoot({
       apiKey: 'AIzaSyAV0MsCXcScyVTpfgelNpIakmESv9W0E3c',
      language: 'en',
      libraries: ['geometry', 'places']
    })
  ],
  providers: [AuthService, AuthGuard, DatePipe, DecimalPipe],
  bootstrap: [AppComponent]
})
export class AppModule { }
