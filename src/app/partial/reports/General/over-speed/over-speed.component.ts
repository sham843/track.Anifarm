import { DatePipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DateTimeAdapter } from 'ng-pick-datetime';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { CommonService } from 'src/app/services/common.service';
import { ExcelService } from 'src/app/services/excel_Pdf.service';
import { MapsAPILoader } from '@agm/core';
import { MainService } from 'src/app/services/main.service';


@Component({
  selector: 'app-over-speed',
  templateUrl: './over-speed.component.html',
  styleUrls: ['./over-speed.component.css']
})
export class OverSpeedComponent implements OnInit {
  select: boolean = false;
  overSpeedFrom!: FormGroup;
  date: any = new Date();
  vechileList: any;
  driverName: any;
  hideReport = false;
  overSpeedReportData: any;
  driverMobile: any;
  vehName: any;
  printBtn: boolean = false;
  submitted = false;
  maxDateOut: any = new Date();
  emptyData = true;
  p: number = 1;
  pageSize: number = 10;
  count!: number;
  overSpeedRepClone: any;
  defaultFromDate = new Date(Date.now() + -1 * 24 * 60 * 60 * 1000);
  defaultToDate = new Date();
  downloadStatus: boolean = true;
  overSpeedReport1: any;
  overSpeedReport: any;
  geoCoders: any;
  counter: any;
  selPageNo:any;

  constructor(
    private _commonService: CommonService,
    private fb: FormBuilder,
    private spinner: NgxSpinnerService,
    public datepipe: DatePipe,
    private toastrService: ToastrService,
    private _excelService: ExcelService,
    private mapsAPILoader: MapsAPILoader,
    public dateTimeAdapter: DateTimeAdapter<any>,
    private _mainService: MainService
  ) { { dateTimeAdapter.setLocale('en-IN'); } }

  ngOnInit(): void {
    this.mapsAPILoader.load().then(() => {
      this.geoCoders = new google.maps.Geocoder;
    });
    this.customForm();
    this.getVehiclesList();
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



  customForm() {
    this.overSpeedFrom = this.fb.group({
      VehicleNumber: ['', Validators.required],
      fromDate: [this.defaultFromDate],
      toDate: [this.defaultToDate],
    })
  }
  get f() { return this.overSpeedFrom.controls };

  onSubmit() {
    this.submitted = true;
    // this.spinner.show();
    this.vechileList.forEach((element: any) => { // get driver name from vehicleNo
      if (element.vehicleNo == this.overSpeedFrom.value.VehicleNumber) {
        this.driverName = element.driverName;
        this.driverMobile = element.driverMobileNo;
        this.vehName = element.vehTypeName;
      }
    });

    let driversData = { // driver name obj
      driverName: this.driverName,
      driverMobileNo: this.driverMobile,
      vehTypeName: this.vehName
    };

    if (this.overSpeedFrom.invalid) {
      this.hideReport = false;
      this.spinner.hide();
      return;
    }
    else {
      let data = this.overSpeedFrom.value;
      let fromDate: any = this.datepipe.transform(data.fromDate, 'yyyy-MM-dd HH:mm');
      let toDate: any = this.datepipe.transform(data.toDate, 'yyyy-MM-dd HH:mm');

      let date1: any = new Date(fromDate);
      let timeStamp = Math.round(new Date(toDate).getTime() / 1000);
      let timeStampYesterday = timeStamp - (24 * 3600);
      let is24 = date1 >= new Date(timeStampYesterday * 1000).getTime();

      if (!is24) {
        this.toastrService.error("Date difference does not exceed 24hr.");
        this.spinner.hide();
        return
      }
      // this.spinner.show();

      this._commonService.setHttp('get', 'vehicle-tracking/reports/get-vehicle-details-for-overspeed?UserId=' + this._commonService.loggedInUserId() + '&VehicleNo=' + data.VehicleNumber + '&FromDate=' + fromDate + '&toDate=' + toDate, true, false, false, 'vehicleTrackingBaseUrlApi');
      this._commonService.getHttp().subscribe((res: any) => {
        if (res.statusCode === "200") {
          this.count = res.responseData.length
          this.overSpeedReport1 = res.responseData;
          // this.overSpeedRepClone = JSON.parse(JSON.stringify(res.responseData));
          this.overSpeedReportData = Object.assign(res.responseData, this.overSpeedFrom.value, driversData);
          this.spinner.hide();
          this.pagination(1)
          this.hideReport = true;
          // 
        }
        else if (res.statusCode === "409") {
          res.statusCode === "409"
          this.toastrService.error(res.statusMessage);
        }
        else {
          this.hideReport = false;
          this.toastrService.error("No data found");
          this.spinner.hide();
        }
      })
    }
  }

  pagination(pageNo: any) {
    this.selPageNo = pageNo;
    let result: any = this._mainService.getAddressBylatLong(pageNo, this.overSpeedReport1, this.pageSize)
    this.overSpeedRepClone = result
    this.overSpeedReport = result
    
  }

  clearForm() {
    this.hideReport = false;
    this.select = true;
    this.submitted = false;
    this.overSpeedFrom.reset({
      VehicleNumber: '',
      toDate: this.defaultToDate,
      fromDate: this.defaultFromDate
    });
  }

  downLoadExcel() {
    let data: any;
    let formDataObj: any = this.overSpeedFrom.value;
    formDataObj['vehName'] = this.vehName;
    let cloned = this.overSpeedRepClone.map((item: any) => Object.assign({}, item));
      data = cloned.filter((x: any,  i:any) => {
        x.srNo = +(this.selPageNo-1+"0")+i+1;
        x.deviceDateTime = this.datepipe.transform(x.deviceDateTime, 'dd-MM-YYYY hh:mm a');
        return x
      });
    let keyExcelHeader = ["Sr No.", " Date", "Speed", "Address"];
    let key = ['srNo', 'deviceDateTime', 'speed', 'address'];
    this.overSpeedFrom.value['pageName'] = "Over Speed Report";
    this._excelService.exportAsExcelFile(keyExcelHeader, key, data, formDataObj);
  }

  downLoadPDF() {
    let data: any;
    let formDataObj: any = this.overSpeedFrom.value;
    formDataObj['vehName'] = this.vehName;
    let cloned = this.overSpeedRepClone.map((item: any) => Object.assign({}, item));
      data = cloned.filter((x: any,  i:any) => {
        x.srNo = +(this.selPageNo-1+"0")+i+1;
        x.deviceDateTime = this.datepipe.transform(x.deviceDateTime, 'dd-MM-YYYY hh:mm a');
        return x
      });
   
    let keyPDFHeader = ["Sr No.", " Date", "Speed", "Address"];
    let key = ['srNo', 'deviceDateTime', 'speed', 'address'];
    this.overSpeedFrom.value['pageName'] = "Over Speed Report";
    this._excelService.downLoadPdf(keyPDFHeader, key, data, formDataObj);
  }
}
