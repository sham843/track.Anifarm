import { Component, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { CommonService } from 'src/app/services/common.service';
import { MainService } from 'src/app/services/main.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
  date: any = new Date();
  show_button: Boolean = false;
  show_eye: Boolean = false;
  loginForm: any;
  submitted = false;
  submittedGP = false;
  data: any;
  password: string = '';
  c_password: string = '';
  toggle: boolean = false;
  result: any;
  hide = true;
  genPass: boolean = false;
  genPasswordForm: any;
  getText = "GENERATE PASSWORD";
  hideBeforeSendSms: boolean = false;
  hideAfterSendSms: boolean = true;
  btnText = "Send SMS";


  constructor(
    private toastrService: ToastrService,
    private formBuilder: FormBuilder,
    private router: Router,
    private spinner: NgxSpinnerService,
    private route: ActivatedRoute,
    private _commonService: CommonService,
    private mainService:MainService
  ) { }

  ngOnInit(): void {
    this.loginForm = this.formBuilder.group({
      username: ['', Validators.required],
      password: ['', Validators.required],
      recaptchaReactive: ['', Validators.required],
      userRole: 'admin'
    });
    this.reCaptcha();
    this.genPasswordForm = this.formBuilder.group({
      MobileNo: ['', Validators.compose([Validators.required, Validators.pattern("^[0-9]*$"), Validators.minLength(10), , Validators.maxLength(10)])],
      OTP: ['']
    });
  }

  changeType(input_field_password: any) {
    if (input_field_password.type == "password")
      input_field_password.type = "text";
    else
      input_field_password.type = "password";

    this.toggle = !this.toggle;
  }

  get f() { return this.loginForm.controls };

  onSubmit() {
    this.spinner.show();
    this.submitted = true;
    if (this.loginForm.invalid) {
      this.spinner.hide();
      return;
    }
    else if (this.loginForm.value.recaptchaReactive !=  this.mainService.checkvalidateCaptcha()){
      this.spinner.hide();
      this.toastrService.error("Invalid Captcha. Please try Again");
    }

    else {
      this.data = this.loginForm.value;
      this._commonService.setHttp('get', 'vehicle-tracking/login/login-web?' + 'UserName=' + this.data.username.trim() + '&Password=' + this.data.password.trim(), false, false, false, 'vehicleTrackingBaseUrlApi');
      this._commonService.getHttp().subscribe((res: any) => {
        if (res.statusCode === "200") {
          localStorage.setItem('loggedInDetails', JSON.stringify(res));
          // localStorage.setItem('loginDateTime', this.date)
          this.router.navigate(['../dashboard'], { relativeTo: this.route })
          this.toastrService.success(res.statusMessage)
          this.spinner.hide();
        }
        else {
          this.spinner.hide();
          this.toastrService.error(res.statusMessage)
        }
      })
    }
  }

  showPassword() {
    this.show_button = !this.show_button;
    this.show_eye = !this.show_eye;
  }

  reCaptcha(){
    this.loginForm.controls['recaptchaReactive'].reset();
    this.mainService.createCaptchaCarrerPage();
  }

  GeneratePassword(action: any) {
    if (action == 'true') {
      this.genPass = true;
    } else {
      this.genPasswordForm.reset();
      this.submittedGP = false;
      this.genPass = false;
    }
  }

  get GP() { return this.genPasswordForm.controls };

  onSubmitGP() {
    // this.spinner.show();
    this.submittedGP = true;
    if (this.genPasswordForm.invalid) {
      this.spinner.hide();
      return;
    }
    else {
      if (this.btnText != 'submit') {
        this._commonService.setHttp('get', 'vehicle-tracking/login/get-user-otp?' + 'MobileNo=' + this.genPasswordForm.value.MobileNo, false, false, false, 'vehicleTrackingBaseUrlApi');
        this._commonService.getHttp().subscribe((res: any) => {
          if (res.statusCode === "200") {
            this.toastrService.success(res.statusMessage);
            this.getText = "Enter OTP for send SMS";
            this.btnText = "submit";
            this.hideAfterSendSms = false;
            this.hideBeforeSendSms = true;
            this.spinner.hide();
          }
          else {
            this.spinner.hide();
            this.toastrService.error(res.statusMessage)
          }
        })
      } //gen otp closed
      else {
        this.genPasswordForm.controls["OTP"].setValidators(Validators.required);
        this.genPasswordForm.controls["OTP"].updateValueAndValidity();
        this.genPasswordForm.controls['OTP'].clearValidators();
        this._commonService.setHttp('get', 'vehicle-tracking/login/login-by-otp?' + 'MobileNo=' + this.genPasswordForm.value.MobileNo + '&OTP=' + this.genPasswordForm.value.OTP.trim(), false, false, false, 'vehicleTrackingBaseUrlApi');
        this._commonService.getHttp().subscribe((res: any) => {
          if (res.statusCode === "200") {
            this.toastrService.success(res.statusMessage);
            this.router.navigate(['generatePassword'], { state: res.responseData[0].id });
            this.spinner.hide();
          }

          else {
            this.spinner.hide();
            this.toastrService.error(res.statusMessage)
          }
        })
      }
    }
  }

  getBack() {
    this.btnText = "Send SMS";
    this.getText = "GENERATE PASSWORD";
    this.hideAfterSendSms = true;
    this.hideBeforeSendSms = false;
  }

  LoginOtp() {
    this.submittedGP = true;
    if (this.genPasswordForm.invalid) {
      this.spinner.hide();
      return;
    }
    this.getText = "Enter OTP for send SMS";
    this.btnText = "submit";
    this.hideAfterSendSms = false;
    this.hideBeforeSendSms = true;
  }
}
