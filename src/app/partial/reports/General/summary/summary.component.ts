import { DatePipe } from '@angular/common';
import { Component, OnInit, NgZone} from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { CommonService } from 'src/app/services/common.service';
import { ExcelService } from 'src/app/services/excel_Pdf.service';
import { MapsAPILoader } from '@agm/core';
import { DateTimeAdapter } from 'ng-pick-datetime';


declare var $: any;
@Component({
  selector: 'app-summary',
  templateUrl: './summary.component.html',
  styleUrls: ['./summary.component.css']
})
export class SummaryComponent implements OnInit {
  select: boolean = false;
  summaryFrom!: FormGroup;
  date: any = new Date();
  vechileList: any;
  driverName: any;
  hideReport = false;
  summaryReportData: any;
  driverMobile: any;
  vehName: any;
  printBtn: boolean = false;
  submitted = false;
  maxDateOut: any = new Date();
  emptyData = true;
  geoCoder: any;
  addressStart: any;
  addressEnd: any;
  latlngStart: any;
  latlngEnd: any;
  loading = false;
  summaryReportDataClone: any;
  mergeArray: any;
  defaultFromDate = new Date(Date.now() + -1 * 24 * 60 * 60 * 1000);
  defaultToDate = new Date();
  downloadStatus: boolean = true;

  constructor(
    private nzZone:NgZone,
    private _commonService: CommonService,
    private fb: FormBuilder,
    private spinner: NgxSpinnerService,
    public datepipe: DatePipe,
    private toastrService: ToastrService,
    private _excelService: ExcelService,
    private mapsAPILoader: MapsAPILoader,
    public dateTimeAdapter: DateTimeAdapter<any>
  ) { { dateTimeAdapter.setLocale('en-IN') } }

  ngOnInit(): void {
    this.mapsAPILoader.load().then(() => {
      this.geoCoder = new google.maps.Geocoder;
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
    this.summaryFrom = this.fb.group({
      VehicleNumber: ['', Validators.required],
      fromDate: [this.defaultFromDate],
      toDate: [this.defaultToDate],
    })
  }

  get f() { return this.summaryFrom.controls };

  onSubmit() {
    this.submitted = true;
    if (this.summaryFrom.invalid) {
      this.hideReport = false;
      this.spinner.hide();
      return;
    }
    else {


      this.vechileList.forEach((element: any) => { // get driver name from vehicleNo
        if (element.vehicleNo == this.summaryFrom.value.VehicleNumber) {
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


      let data = this.summaryFrom.value;

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

      this.spinner.show();
      this._commonService.setHttp('get', 'vehicle-tracking/tracking/get-summary-report?VehicleNumber=' + data.VehicleNumber + '&fromDate=' + fromDate + '&toDate=' + toDate, true, false, false, 'vehicleTrackingBaseUrlApi');
      this._commonService.getHttp().subscribe((res: any) => {
        if (res.statusCode === "200") {
          this.spinner.hide();
          this.addressStart = "";
          this.addressEnd = "";
          this.getAddress(res.responseData.startLatLong, 'startAddress');
          this.getAddress(res.responseData.endLatLong, 'endAddress');
          this.mergeArray = Object.assign(res.responseData, this.summaryFrom.value, driversData);
          this.summaryReportDataClone = JSON.parse(JSON.stringify(this.mergeArray));
          this.summaryReportData = Object.assign(res.responseData, this.summaryFrom.value, driversData);
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

  dateFormat(selDate: any) {
    return this.datepipe.transform(selDate, 'dd-MM-yyyy');
  }


  clearForm() {
    this.hideReport = false;
    this.select = true;
    this.submitted = false;
    this.summaryFrom.reset({
      VehicleNumber: '',
      fromDate:this.defaultFromDate,
      toDate: this.defaultToDate,
    });
  }



  downLoadExcel() {
    let row: any = [];
    if (this.downloadStatus) {
      this.summaryReportDataClone['srNo'] = 1;
      this.summaryReportDataClone['runningTime'] = this.datepipe.transform(this.summaryReportDataClone.runningTime * 1000 * 60, 'HH:mm', 'UTC') + " HH:mm";
      this.summaryReportDataClone['stoppageTime'] = this.datepipe.transform(this.summaryReportDataClone.stoppageTime * 1000 * 60, 'HH:mm', 'UTC') + " HH:mm";
      this.summaryReportDataClone['idleTime'] = this.datepipe.transform(this.summaryReportDataClone.idleTime * 1000 * 60, 'HH:mm', 'UTC') + " HH:mm";
      this.summaryReportDataClone['maxSpeed'] = this.summaryReportDataClone.maxSpeed + " Km/h";
      row.push(this.summaryReportDataClone);
      this.downloadStatus = false;
    }
    else {
      row.push(this.summaryReportDataClone);
    }
    let keyExcelHeader = ["Sr No.","Driver Name", "Mob. No.", "Veh. Type", "Running Time", "Stoppage Time", " Idle Time", "Max Speed", "Travelled Distance"];
    let key = ['srNo','driverName', 'driverMobileNo', 'vehTypeName', 'runningTime', 'stoppageTime', 'idleTime', 'maxSpeed', 'travelledDistance'];
    this.summaryFrom.value['pageName'] = "Summary Report";
    let formDataObj: any = this.summaryFrom.value;
    formDataObj['vehName']  =  this.vehName;
    this._excelService.exportAsExcelFile(keyExcelHeader, key, row, formDataObj);

  }


  pdfDownload() {
    let row: any = [];
    if (this.downloadStatus) {
      this.summaryReportDataClone['srNo'] = 1;
      this.summaryReportDataClone['runningTime'] = this.datepipe.transform(this.summaryReportDataClone.runningTime * 1000 * 60, 'HH:mm', 'UTC') + " HH:mm";
      this.summaryReportDataClone['stoppageTime'] = this.datepipe.transform(this.summaryReportDataClone.stoppageTime * 1000 * 60, 'HH:mm', 'UTC') + " HH:mm";
      this.summaryReportDataClone['idleTime'] = this.datepipe.transform(this.summaryReportDataClone.idleTime * 1000 * 60, 'HH:mm', 'UTC') + " HH:mm";
      this.summaryReportDataClone['maxSpeed'] = this.summaryReportDataClone.maxSpeed + " Km/h";
      row.push(this.summaryReportDataClone);
      this.downloadStatus = false;
    }
    else {
      row.push(this.summaryReportDataClone);
    }
    let keyPDFHeader = ["Sr No.","Driver Name", "Mob. No.", "Veh. Type", "Running Time", "Stoppage Time", " Idle Time", "Max Speed", "Travelled Distance"];
    let key = ['srNo','driverName', 'driverMobileNo', 'vehTypeName', 'runningTime', 'stoppageTime', 'idleTime', 'maxSpeed', 'travelledDistance'];
    this.summaryFrom.value['pageName'] = "Summary Report";
    let formDataObj: any = this.summaryFrom.value;
    formDataObj['vehName']  =  this.vehName;
    this._excelService.downLoadPdf(keyPDFHeader, key, row, formDataObj);

  }

  getAddress(getLatlng: any, address: any) {
    if (getLatlng != null) {
      this.loading = true;
      let latlng: any = getLatlng.split(",")
      this.geoCoder.geocode({ 'location': { lat: Number(latlng[0]), lng: Number(latlng[1]) } }, (results: any) => {
        if (address == 'startAddress') {
          this.nzZone.run(() => {
          this.addressStart = results[0].formatted_address;
          this.loading = false;
        });
        } else {
          this.nzZone.run(() => {
          this.addressEnd = results[0].formatted_address;
          this.loading = false;
        });
        }
      });
    }

    else {
      this.addressStart = "Unknown location";
      this.addressEnd = "Unknown location"
    }
  }




}

