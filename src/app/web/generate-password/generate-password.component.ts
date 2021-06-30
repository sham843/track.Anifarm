import { Component, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { CommonService } from 'src/app/services/common.service';

@Component({
  selector: 'app-generate-password',
  templateUrl: './generate-password.component.html',
  styleUrls: ['./generate-password.component.css']
})
export class GeneratePasswordComponent implements OnInit {

  
  changePasswordForm: any;
  submitted = false;
  show_button: Boolean = false;
  show_eye: Boolean = false;
  show_button1: Boolean = false;
  show_eye1: Boolean = false;
  show_button2: Boolean = false;
  show_eye2: Boolean = false;
  id:any

  constructor(
    private _commonService: CommonService,
    private fb: FormBuilder,
    private spinner: NgxSpinnerService,
    private toastrService: ToastrService,
    private router: Router,
    private route: ActivatedRoute,

  ) {
    const Obj:any = this.router.getCurrentNavigation();
    const getObj:any = Obj.extras.state as {data:any};
    this.id = getObj;
    if(!this.id){
      this.router.navigate(['../login']);
    }
   }

  ngOnInit(): void {
    this.customForm();
  }


  customForm() {
    this.changePasswordForm = this.fb.group({
      newPassword: ['', [Validators.required, this.passwordValid]],
      ConfirmPassword: ['',[Validators.required, this.passwordValid]],
    })
  }

  get f() { return this.changePasswordForm.controls };

  onSubmit() {
    this.spinner.show();
    this.submitted = true;
    if (this.changePasswordForm.invalid) {
      this.spinner.hide();
      return;
    }
    else {
      if (this.changePasswordForm.value.newPassword == this.changePasswordForm.value.ConfirmPassword) {
        let data = this.changePasswordForm.value;
        // /vehicle-tracking/login/
        this._commonService.setHttp('get', 'vehicle-tracking/login/set-password?' + 'UserId=' + this.id + '&NewPassword=' + this.changePasswordForm.value.newPassword, false, false, false, 'vehicleTrackingBaseUrlApi'); 
        this._commonService.getHttp().subscribe((res: any) => {
          if (res.statusCode === "200") {
            this.router.navigate(['login']);
            this.toastrService.success(res.responseData)
            this.spinner.hide();
            this.clearForm();
          }
          else {
            this.spinner.hide();
            this.toastrService.error(res.responseData)
          }
        })
        this.spinner.hide();
      }
      else {
        this.spinner.hide();
        this.toastrService.error("New password and Confirm password should not be same")
      }

    }

  
  }

  showPassword(data: any) {
    if (data == 'old') {
      this.show_button = !this.show_button;
      this.show_eye = !this.show_eye;
    } else if (data == 'new') {
      this.show_button1 = !this.show_button1;
      this.show_eye1 = !this.show_eye1;
    } else {
      this.show_button2 = !this.show_button2;
      this.show_eye2 = !this.show_eye2;
    }

  }

  clearForm() {
    this.submitted = false;
    this.changePasswordForm.reset({
      oldPassword: '',
      newPassword: '',
      ConfirmPassword: ''
    });
  }

  passwordValid(controls:any) {
    const regExp = new RegExp(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d.*)(?=.*\W.*)[a-zA-Z0-9\S]{6,}$/);
    if (regExp.test(controls.value)) {
      return null;
    } else {
      return { passwordValid: true }
    }
  }

  redirectLogin(){
    this.router.navigate(['login']);
  }

}
