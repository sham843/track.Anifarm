import { any } from '@amcharts/amcharts4/.internal/core/utils/Array';
import { DatePipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DateTimeAdapter } from 'ng-pick-datetime';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { CommonService } from 'src/app/services/common.service';
import { ExcelService } from 'src/app/services/excel_Pdf.service';


@Component({
  selector: 'app-etp',
  templateUrl: './etp.component.html',
  styleUrls: ['./etp.component.css']
})
export class EtpComponent implements OnInit {

  select: boolean = false;
  invoiceFrom!: FormGroup;
  date: any = new Date();
  vechileList: any;
  driverName: any;
  hideReport = false;
  invoiceReportData: any;
  driverMobile: any;
  vehName: any;
  printBtn: boolean = false;
  submitted = false;
  maxDateOut: any = new Date();
  emptyData = true;
  p: number = 1;
  vchId: any;
  downloadStatus: boolean = true;
  invoiceReportDataClone: any;
  defaultFromDate = new Date(Date.now() + -7 * 24 * 60 * 60 * 1000);
  defaultToDate = new Date();

  constructor(
    private _commonService: CommonService,
    private fb: FormBuilder,
    private spinner: NgxSpinnerService,
    public datepipe: DatePipe,
    private toastrService: ToastrService,
    private _excelService: ExcelService,
    public dateTimeAdapter: DateTimeAdapter<any>
  ) { { dateTimeAdapter.setLocale('en-IN'); } }

  ngOnInit(): void {
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
    this.invoiceFrom = this.fb.group({
      VehicleNumber: ['', Validators.required],
      fromDate: [this.defaultFromDate],
      toDate: [this.defaultToDate],
    })
  }
  get f() { return this.invoiceFrom.controls };


  onSubmit() {
    this.submitted = true;
    // this.spinner.show();


    if (this.invoiceFrom.invalid) {
      this.hideReport = false;
      this.spinner.hide();
      return;
    }
    else {

      this.vechileList.forEach((element: any) => { // get driver name from vehicleNo
        if (element.vehicleNo == this.invoiceFrom.value.VehicleNumber) {
          this.driverName = element.driverName;
          this.driverMobile = element.driverMobileNo;
          this.vehName = element.vehTypeName;
          this.vchId = element.vehicleId
        }
      });

      let driversData = { // driver name obj
        driverName: this.driverName,
        driverMobileNo: this.driverMobile,
        vehTypeName: this.vehName
      };
      let data = this.invoiceFrom.value;
      let fromDate: any = this.datepipe.transform(data.fromDate, 'yyyy-MM-dd HH:mm');
      let toDate: any = this.datepipe.transform(data.toDate, 'yyyy-MM-dd HH:mm');

      let date1: any = new Date(fromDate);
      let timeStamp = Math.round(new Date(toDate).getTime() / 1000);
      let timeStampYesterday = timeStamp - (168 * 3600);
      let is24 = date1 >= new Date(timeStampYesterday * 1000).getTime();

      if (!is24) {
        this.toastrService.error("Date difference does not exceed 7 days.");
        this.spinner.hide();
        return
      }

      this.spinner.show();
      this._commonService.setHttp('get', 'vehicle-tracking/reports/get-invoice-history?UserId=' + this._commonService.loggedInUserId() + '&VehicleId=' + this.vchId + '&FromDate=' + fromDate + '&toDate=' + toDate, true, false, false, 'vehicleTrackingBaseUrlApi');
      this._commonService.getHttp().subscribe((res: any) => {

        if (res.statusCode === "200") {
          this.invoiceReportDataClone = JSON.parse(JSON.stringify(res.responseData.data));
          this.invoiceReportData = Object.assign(res.responseData.data, this.invoiceFrom.value, driversData);
          this.hideReport = true;

          this.spinner.hide();
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

  dateFormat(selDate: any) {
    return this.datepipe.transform(selDate, 'dd-MM-yyyy');
  }

  clearForm() {
    this.hideReport = false;
    this.select = true;
    this.submitted = false;
    this.invoiceFrom.reset({
      VehicleNumber: '',
      toDate: this.defaultToDate,
      fromDate: this.defaultFromDate
    });
  }



  downLoadExcel() {
    let data: any;
    if (this.downloadStatus) {
      data = this.invoiceReportDataClone.map((x: any) => {
        x.driverName = x.driverName + " (" + x.driverMobileNo + ")";
        return x
      });
      this.downloadStatus = false;
    } else { data = this.invoiceReportDataClone }

    let keyExcelHeader = ["Sr No.", "eTP", "Validity From", "Validity  To", "Plot Name", "Destination", "Driver Name", "Distance", "Quantity"];
    let key = ['rownumber', 'invoiceNo', 'validityFrom', 'validityUpto', 'plotName', 'destination', 'driverName', 'distance', 'quantity'];
    this.invoiceFrom.value['pageName'] = "eTP Report";
    let formDataObj: any = this.invoiceFrom.value;
    formDataObj['vehName']  =  this.vehName;
    this._excelService.exportAsExcelFile(keyExcelHeader, key, data, formDataObj);
  }

  downLoadPDF() {
    let data: any;
    if (this.downloadStatus) {
      data = this.invoiceReportDataClone.map((x: any) => {
        x.driverName = x.driverName + " (" + x.driverMobileNo + ")";
        return x
      });
      this.downloadStatus = false;
    } else { data = this.invoiceReportDataClone }

    let keyPDFHeader = ["Sr No.", "eTP", "Validity From", "Validity  To", "Plot Name", "Destination", "Driver Name", "Distance", "Quantity"];
    let key = ['rownumber', 'invoiceNo', 'validityFrom', 'validityUpto', 'plotName', 'destination', 'driverName', 'distance', 'quantity'];
    this.invoiceFrom.value['pageName'] = "eTP Report";
    let formDataObj: any = this.invoiceFrom.value;
    formDataObj['vehName']  =  this.vehName;
    this._excelService.downLoadPdf(keyPDFHeader, key, data, formDataObj);
  }
}
