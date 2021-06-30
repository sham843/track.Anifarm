import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';

import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class LoggedInAuthGuard implements CanActivate {
  constructor(private _authService: AuthService,
    private _router: Router, private toastrService:ToastrService) { }

  canActivate(): any {
    if (this._authService.isLoggedIn()) {
      this._router.navigate(['/dashboard']);
      // this._snackBar.open("You have already logged in", "Ok", {
      //   duration: 2000,
      // })
      this.toastrService.success('You are already logged in');
  
    } else {
      return true;
    }
  }
}
