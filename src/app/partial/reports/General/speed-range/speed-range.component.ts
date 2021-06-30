import { DatePipe } from '@angular/common';
import { Component, NgZone, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { CommonService } from 'src/app/services/common.service';
import { ExcelService } from 'src/app/services/excel_Pdf.service';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import { DateTimeAdapter } from 'ng-pick-datetime';
import { MapsAPILoader } from '@agm/core';
import { MainService } from 'src/app/services/main.service';

@Component({
  selector: 'app-speed-range',
  templateUrl: './speed-range.component.html',
  styleUrls: ['./speed-range.component.css'],
  providers: [DatePipe]
})
export class SpeedRangeComponent implements OnInit {
  select: boolean = false;
  speedRangeFrom: any;
  date: any = new Date();
  vechileList: any;
  driverName: any;
  hideReport = false;
  speedRangeReportData: any;
  driverMobile: any;
  vehName: any;
  printBtn: boolean = false;
  submitted = false;
  maxDateOut: any = new Date();
  emptyData = true;
  p: number = 1;
  pageSize: number = 10;
  count: any;
  speedRangeReportDataClone:any;
  defaultFromDate = new Date(Date.now() + -1 * 24 * 60 * 60 * 1000);
  defaultToDate = new Date()
  downloadStatus: boolean = true;
  speedRangeReportData1:any;
  speedRangeReport:any;
  selPageNo:any;
  geoCoders:any;
  
  constructor(
    private _commonService: CommonService,
    private fb: FormBuilder,
    private spinner: NgxSpinnerService,
    public datepipe: DatePipe,
    private toastrService: ToastrService,
    private _excelService: ExcelService,
    public dateTimeAdapter: DateTimeAdapter<any>,
    private ngZone:NgZone,
    private mapsAPILoader: MapsAPILoader,
    private _mainService:MainService
    ) { { dateTimeAdapter.setLocale('en-IN'); }}

  ngOnInit(): void {
    this.mapsAPILoader.load().then(() => {
      this.geoCoders = new google.maps.Geocoder;
    });
    this.customForm();
    this.getVehiclesList();
  }


  getVehiclesList() { //Call Api vehicles-list
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
    this.speedRangeFrom = this.fb.group({
      VehicleNumber: ['', Validators.required],
      fromDate: [this.defaultFromDate],
      toDate: [this.defaultToDate],
      SpeedfromRange: ['',  Validators.required],
      SpeedToRange: ['', Validators.required],
    })
  }
  get f() { return this.speedRangeFrom.controls };



  onSubmit() {
    this.submitted = true;

    this.vechileList.forEach((element: any) => { // get driver name from vehicleNo
      if (element.vehicleNo == this.speedRangeFrom.value.VehicleNumber) {
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

    if (this.speedRangeFrom.invalid) {
      this.hideReport = false;
      this.spinner.hide();
      return;
    }
    else {
      let data = this.speedRangeFrom.value;
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
      }else if(this.speedRangeFrom.value.SpeedfromRange <= 0 || this.speedRangeFrom.value.SpeedToRange <= 0 || (this.speedRangeFrom.value.SpeedToRange < this.speedRangeFrom.value.SpeedfromRange || this.speedRangeFrom.value.SpeedfromRange >= 261 || this.speedRangeFrom.value.SpeedToRange >= 261 )){
        this.toastrService.error("Enter proper speed range")
        return
      }
     this.spinner.show();

      this._commonService.setHttp('get', 'vehicle-tracking/reports/get-overspeed-report-speedrange?UserId=' + this._commonService.loggedInUserId() + '&VehicleNo=' + data.VehicleNumber + '&FromDate=' + fromDate + '&toDate=' + toDate+'&FromSpeed='+ data.SpeedfromRange+'&ToSpeed='+ data.SpeedToRange, true, false , false,'vehicleTrackingBaseUrlApi');
      this._commonService.getHttp().subscribe((res:any) => {  
        if (res.statusCode === "200") {
          this.count = res.responseData.length
          this.speedRangeReportData1 = res.responseData;
          // this.speedRangeReportDataClone = JSON.parse(JSON.stringify(res.responseData));
          // this.speedRangeReportDataClone = Object.assign(res.responseData, this.speedRangeFrom.value, driversData);
          this.speedRangeReportData = Object.assign(res.responseData, this.speedRangeFrom.value, driversData);
          this.spinner.hide();
          this.pagination(1);
          this.hideReport = true;
          
        }
        else if (res.statusCode === "409") {
          this.spinner.hide();
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
    let result: any = this._mainService.getAddressBylatLong(pageNo, this.speedRangeReportData1, this.pageSize)
    this.speedRangeReport = result;
    this.speedRangeReportDataClone =  result;
  }


 


  clearForm() {
    this.hideReport = false;
    this.select = true;
    this.submitted = false;
    this.speedRangeFrom.reset({
      VehicleNumber: '',
      fromDate:this.defaultFromDate,
      toDate: this.defaultToDate,
    });
  }

  downLoadExcel() {
    let data: any;
    let cloned = this.speedRangeReportDataClone.map((item: any) => Object.assign({}, item));
      data = cloned.map((x: any, i:any) => {
        x.srNo = +(this.selPageNo-1+"0")+i+1;
        x.deviceDateTime = this.datepipe.transform(x.deviceDateTime, 'dd-MM-YYYY hh:mm a')
        return x
      });
    let keyExcelHeader = ["Sr No."," Date","Speed(Km/h)","Address"];
    let key = ['srNo', 'deviceDateTime', 'speed', 'address'];
    this.speedRangeFrom.value['pageName']="Speed Range Report";
    let formDataObj:any  =  this.speedRangeFrom.value;
    formDataObj['vehName']  =  this.vehName;
    this._excelService.exportAsExcelFile(keyExcelHeader,key, data,formDataObj);
  }

  downLoadPDF() {
    let data: any;
    let cloned = this.speedRangeReportDataClone.map((item: any) => Object.assign({}, item));
      data = cloned.map((x: any, i:any) => {
        x.srNo = +(this.selPageNo-1+"0")+i+1;
        x.deviceDateTime = this.datepipe.transform(x.deviceDateTime, 'dd-MM-YYYY hh:mm a')
        return x
      });
 
    let keyPDFHeader = ["Sr No."," Date","Speed(Km/h)","Address"];
    let key = ['srNo', 'deviceDateTime', 'speed', 'address'];
    this.speedRangeFrom.value['pageName']="Speed Range Report";
    let formDataObj:any  =  this.speedRangeFrom.value;
    formDataObj['vehName']  =  this.vehName;
    this._excelService.downLoadPdf(keyPDFHeader,key, data,formDataObj);

  }
}
