import { DatePipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { CommonService } from 'src/app/services/common.service';
@Component({
  selector: 'app-break-down',
  templateUrl: './break-down.component.html',
  styleUrls: ['./break-down.component.css']
})
export class BreakDownComponent implements OnInit {
  //for dropdown with searchbar
  vechileList: any;
  breakDownForm: any;
  submitted = false;
  select: boolean = false;
  emptyData = true;
  VStatus = [{ "fullName": "Breakdown", "shortName": 'BKD' }, { "fullName": "Start", "shortName": 'RESTART' }];
  Breakdown = true;

  constructor(
    private _commonService: CommonService,
    private fb: FormBuilder,
    private spinner: NgxSpinnerService,
    public datepipe: DatePipe,
    private toastrService: ToastrService,

  ) { }

  ngOnInit(): void {
    this.getVehiclesList();
    this.customForm();
  }




  getVehiclesList() {
    this.spinner.show();
    this._commonService.setHttp('get', 'vehicle-tracking/dashboard/get-vehicles-list?UserId=' + this._commonService.loggedInUserId(), true, false, false, 'vehicleTrackingBaseUrlApi');
    this._commonService.getHttp().subscribe((res: any) => {
      if (res.statusCode === "200") {
        this.emptyData = false;
        this.spinner.hide();
        this.vechileList = res;
        this.vechileList = this.vechileList.responseData;
      }
      else if (res.statusCode === "409") {
        this.spinner.hide();
        this.toastrService.error(res.statusMessage);
      }
      else {
        this.spinner.hide();
        this.emptyData = true;
      }

    })
  }
  change(event: any) {
  }
  customForm() {
    this.breakDownForm = this.fb.group({
      vehicleId: ['', Validators.required],
      invoiceNo: ['', [Validators.required, Validators.pattern("^((\\+91-?)|0)?[0-9]{10}$")]],
      breakDownStatus: ['BKD'],
    })
  }

  get f() { return this.breakDownForm.controls };

  onSubmit() {
    this.submitted = true;
    this.spinner.show();

    if (this.breakDownForm.invalid) {
      this.spinner.hide();
      return;
    }
    else {
      let selVechObj = this.vechileList.find((item: any) => {
        if (item.vehicleNo == this.breakDownForm.value.vehicleId) {
          return item
        }
      });
      this._commonService.setHttp('get', 'vehicle-tracking/mahakhanij/register-breakdown?UserId=' + this._commonService.loggedInUserId() + '&InvoiceNo=' + this.breakDownForm.value.invoiceNo.toString() + '&VehicleId=' + selVechObj.vehicleId + '&MobileNo=' + selVechObj.driverMobileNo + '&SubKeyword=' + this.breakDownForm.value.breakDownStatus.toString() + '&Source=TrackWebApp', true, false, false, 'vehicleTrackingBaseUrlApi');
      this._commonService.getHttp().subscribe((res: any) => {
        this.spinner.hide();
        if (res.statusCode === "200") {
          if (res.responseData[0].isSuccess == "True") {
            this.toastrService.success(res.responseData[0].mSg);
            this.spinner.hide();
            this.submitted = false;
          }
          else if (res.responseData[0].isSuccess == "False") {
            this.toastrService.error(res.responseData[0].mSg);
            return

          }
        }
        else if (res.statusCode === "409") {
          this.toastrService.error(res.statusMessage);
        }
        else {
          this.toastrService.error("No data found");
          this.spinner.hide();
        }
      },

      );
    }
  }
  clearForm() {
    this.select = true;
    this.submitted = false;
    this.breakDownForm.reset({
      breakDownStatus: 'BKD'
    });
  }

}
