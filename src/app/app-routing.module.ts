import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from './auth/auth.guard';
import { PageNotFoundComponent } from './errors/page-not-found/page-not-found.component';
import { Layout1Component } from './web/layout1/layout1.component';
import { Layout2Component } from './partial/layout2/layout2.component';
import { AccessDeniedComponent } from './errors/access-denied/access-denied.component';
import { AuthorizationGuard } from './auth/authorization.guard';
import { LoggedInAuthGuard } from './auth/logged-in-auth.guard';
import { GeneratePasswordComponent } from './web/generate-password/generate-password.component';
import { PaymentReceiptComponent } from './partial/master/recharge/payment-receipt/payment-receipt.component';


const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { // for website
    path: '', component: Layout1Component,
    children: [
      { path: 'login', loadChildren: () => import('./web/login/login.module').then(m => m.LoginModule), data: { title: 'Login' }, canActivate:[LoggedInAuthGuard]},
      { path: 'generatePassword', component:GeneratePasswordComponent, data: { title: 'Generate Password' }, canActivate:[LoggedInAuthGuard]},
    ]
  },
  { // for dashboard  allowedRoles: [10, 'dc', 'supervisor',] user 10 transporter
    path: '', canActivate: [AuthGuard],
    canActivateChild: [AuthorizationGuard],
    component: Layout2Component,
    children: [
      { path: 'dashboard', loadChildren: () => import('./partial/dashboard/dashboard.module').then(m => m.DashboardModule), data: { title: 'Dashboard', allowedRoles: [8, 10, 29] } },
      { path: 'map', loadChildren: () => import('./partial/maps/map/map.module').then(m => m.MapModule), data: { title: 'Map', allowedRoles: [8, 10, 29]  } },
      { path: 'tracking', loadChildren: () => import('./partial/maps/tracking/tracking.module').then(m => m.TrackingModule), data: { title: 'Tracking',allowedRoles: [8, 10, 29]} },
      { path: 'poi', loadChildren: () => import('./partial/master/poi/poi.module').then(m => m.PoiModule), data: { title: 'POI Details', allowedRoles: [8, 10, 29] } },
      { path: 'breakDown', loadChildren: () => import('./partial/master/break-down/break-down.module').then(m => m.BreakDownModule), data: { title: 'Break Down Details', allowedRoles: [8, 10, 29]} },
      { path: 'recharge', loadChildren: () => import('./partial/master/recharge/recharge.module').then(m => m.RechargeModule), data: { title: 'Recharge', allowedRoles: [8, 10, 29] } },
      { path: 'payment', component: PaymentReceiptComponent, data: { title: 'Payment Receipt'}},
      { path: 'paymentHistory', loadChildren: () => import('./partial/master/recharge/payment-history/payment-history.module').then(m => m.PaymentHistoryModule), data: { title: 'Payment History', allowedRoles: [8, 10, 29] } },
      { path: 'summary', loadChildren: () => import('./partial/reports/General/summary/summary.module').then(m => m.SummaryModule), data: { title: 'Summary Report', allowedRoles: [8, 10, 29] } },
      { path: 'speedRange', loadChildren: () => import('./partial/reports/General/speed-range/speed-range.module').then(m => m.SpeedRangeModule), data: { title: 'Speed Range Report', allowedRoles: [8, 10, 29] } },
      { path: 'trip', loadChildren: () => import('./partial/reports/General/trip/trip.module').then(m => m.TripModule), data: { title: 'Trip Report', allowedRoles: [8, 10, 29] } },
      { path: 'address', loadChildren: () => import('./partial/reports/General/address/address.module').then(m => m.AddressModule), data: { title: 'Address report', allowedRoles: [8, 10, 29] } },
      { path: 'overSpeed', loadChildren: () => import('./partial/reports/General/over-speed/over-speed.module').then(m => m.OverSpeedModule), data: { title: 'Over Speed Report', allowedRoles: [8, 10, 29]} },
      { path: 'eTP', loadChildren: () => import('./partial/reports/Mining/etp/etp.module').then(m => m.EtpModule), data: { title: 'eTP Report', allowedRoles: [8, 10, 29]} },
      { path: 'materialOrder', loadChildren: () => import('./partial/reports/Mining/material-order/material-order.module').then(m => m.MaterialOrderModule), data: { title: 'Material Order Enquiry', allowedRoles: [8, 10, 29]} },
      { path: 'changePassword', loadChildren: () => import('./partial/change-password/change-password.module').then(m => m.ChangePasswordModule) },
    ]
  },
  { path: 'accessdenied', component: AccessDeniedComponent },
  { path: '**', component: PageNotFoundComponent}
  // internet error page 
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
