import { AfterViewInit, Component, NgZone, OnInit } from '@angular/core';
import { DatePipe } from '@angular/common';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { CommonService } from 'src/app/services/common.service';
import { ExcelService } from 'src/app/services/excel_Pdf.service';
import { MapsAPILoader } from '@agm/core';
import { DateTimeAdapter } from 'ng-pick-datetime';
import { MainService } from 'src/app/services/main.service';


@Component({
  selector: 'app-address',
  templateUrl: './address.component.html',
  styleUrls: ['./address.component.css']
})
export class AddressComponent implements OnInit {
  date = new Date();
  vechId: any;
  select: boolean = false;
  addressFrom!: FormGroup;
  vechileList: any;
  driverName: any;
  hideReport = false;
  addresData: any;
  driverMobile: any;
  vehName: any;
  submitted = false;
  maxDateOut = new Date();
  emptyData = true;
  p: number = 1;
  pageSize: number = 10;
  count: any;
  addresDataClone: any =  [];
  geoCoders: any;
  defaultFromDate = new Date(Date.now() + -1 * 24 * 60 * 60 * 1000);
  defaultToDate = new Date();
  downloadStatus: boolean = true;
  addresDataReport1:any;
  addresDataReport:any =  [];
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
    private ngZone:NgZone,
    private _mainService:MainService
  ) { { dateTimeAdapter.setLocale('en-IN'); 

}
 
}

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
    this.addressFrom = this.fb.group({
      VehicleNumber: ['', Validators.compose([Validators.required, Validators.pattern('.+')])],
      fromDate: [this.defaultFromDate],
      toDate: [this.defaultToDate],
    })
  }
  get f() { return this.addressFrom.controls };

  onSubmit() {
    this.submitted = true;

    this.vechileList.forEach((element: any) => { // get driver name from vehicleNo
      if (element.vehicleNo == this.addressFrom.value.VehicleNumber) {
        this.driverName = element.driverName;
        this.driverMobile = element.driverMobileNo;
        this.vehName = element.vehTypeName;
        this.vechId = element?.vehicleId
      }
    });

    let driversData = { // driver name obj
      driverName: this.driverName,
      driverMobileNo: this.driverMobile,
      vehTypeName: this.vehName
    };
    if (this.addressFrom.invalid) {
      this.hideReport = false;
      this.spinner.hide();
      return;
    }
    else {
      let data:any = this.addressFrom.value;
      let fromDate:any = this.datepipe.transform(data.fromDate, 'yyyy-MM-dd HH:mm');
      let toDate:any = this.datepipe.transform(data.toDate, 'yyyy-MM-dd HH:mm');

      let date1: any = new Date(fromDate);
      let timeStamp = Math.round(new Date(toDate).getTime() / 1000);
      let timeStampYesterday = timeStamp - (24 * 3600);
      let is24 = date1 >= new Date(timeStampYesterday * 1000).getTime();

      if (!is24) {
        this.toastrService.error("Date difference does not exceed 24hr.");
        this.spinner.hide();
        return
      }
     
   
      this.spinner.show();
      this._commonService.setHttp('get', 'vehicle-tracking/tracking/get-tracking-address-mob?VehicleNo=' + data.VehicleNumber + '&VehicleId=' + this.vechId + '&FromDate=' + fromDate + '&toDate=' + toDate, true, false, false, 'vehicleTrackingBaseUrlApi');
      this._commonService.getHttp().subscribe((res: any) => {

        if (res.statusCode === "200") {
          let data = res.responseData
          this.count = res.responseData.length;
          this.addresDataReport1 = data;
          this.spinner.hide();
          this.pagination(1)
          this.addresData = Object.assign(data, this.addressFrom.value, driversData);
          // this.addresDataClone = data;
          // JSON.parse(JSON.stringify( this.addresData));
          this.hideReport = true;
    
        }
        else if (res.statusCode === "409") {
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
    let result: any = this._mainService.getAddressBylatLong(pageNo, this.addresDataReport1, this.pageSize);
    this.addresDataClone =  result;
    this.addresDataReport = result;

  
  }

  clearForm() {
    this.hideReport = false;
    this.select = true;
    this.submitted = false;
    this.addressFrom.reset({
      VehicleNumber: '',
      fromDate:this.defaultFromDate,
      toDate: this.defaultToDate,
    });
  } 

  downLoadExcel() {
    let data:any;
    let cloned = this.addresDataClone.map((item: any) => Object.assign({}, item));
    data = cloned.map((x: any, i:any) => {
      x.srNo = +(this.selPageNo-1+"0")+i+1
      x.deviceDatetime = this.datepipe.transform(x.deviceDatetime, 'dd-MM-YYYY hh:mm a')
      return x
    });
    let keyExcelHeader = ["Sr No.","Date", "Address"];
    let key = ['srNo','deviceDatetime', 'address'];
    this.addressFrom.value['pageName'] = "Address Report";
    let formDataObj: any = this.addressFrom.value;
    formDataObj['vehName']  =  this.vehName;
    this._excelService.exportAsExcelFile(keyExcelHeader, key, data, formDataObj);
  }

  downLoadPDF() {
    let data:any;
    let cloned = this.addresDataClone.map((item: any) => Object.assign({}, item));
    data = cloned.map((x: any, i:any) => {
      x.srNo = +(this.selPageNo-1+"0")+i+1
      x.deviceDatetime = this.datepipe.transform(x.deviceDatetime, 'dd-MM-YYYY hh:mm a')
      return x
    });
    let keyPDFHeader = ["Sr No.","Date", "Address"];
    let key = ['srNo','deviceDatetime', 'address'];
    this.addressFrom.value['pageName'] = "Address Report";
    let formDataObj: any = this.addressFrom.value;
    formDataObj['vehName']  =  this.vehName;
   
    this._excelService.downLoadPdf(keyPDFHeader, key, data, formDataObj);
  }
}
