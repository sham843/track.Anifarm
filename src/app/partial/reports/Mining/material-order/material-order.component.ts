import { DatePipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { CommonService } from 'src/app/services/common.service';
import { ExcelService } from 'src/app/services/excel_Pdf.service';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import { DateTimeAdapter } from 'ng-pick-datetime';

@Component({
  selector: 'app-material-order',
  templateUrl: './material-order.component.html',
  styleUrls: ['./material-order.component.css'],
  providers: [DatePipe]
})
export class MaterialOrderComponent implements OnInit {
  materialOrderFrom!: FormGroup;
  date: any = new Date();
  hideReport = false;
  materialOrderReportData: any;
  printBtn: boolean = false;
  submitted = false;
  maxDateOut: any = new Date();
  emptyData = true;
  p: number = 1;
  popUpMaterialDetailsData:any;
  popUpMaterialDetailsDataClone:any;
  rowNumber:any;
  materialName:any;
  quantity:any;
  materialOrderReportDataClone:any;
  defaultFromDate = new Date(Date.now() + -7 * 24 * 60 * 60 * 1000);
  defaultToDate = new Date();
  downloadStatus: boolean = true;


  constructor(
    private _commonService: CommonService,
    private fb: FormBuilder,
    private spinner: NgxSpinnerService,
    public datepipe: DatePipe,
    private toastrService: ToastrService,
    private _excelService: ExcelService,
    public dateTimeAdapter: DateTimeAdapter<any>
    ) { { dateTimeAdapter.setLocale('en-IN'); }}

  
  ngOnInit(): void {
    this.customForm();
  }
  
  customForm() {
    this.materialOrderFrom = this.fb.group({
      fromDate: [this.defaultFromDate],
      toDate: [this.defaultToDate],
    })
  }
  get f() { return this.materialOrderFrom.controls };

  onSubmit() {
    this.submitted = true;

    if (this.materialOrderFrom.invalid) {
      this.hideReport = false;
      this.spinner.hide();
      return;
    }
    else {
      let data = this.materialOrderFrom.value;
      let fromDate:any = this.datepipe.transform(data.fromDate, 'yyyy-MM-dd HH:mm');
      let toDate:any = this.datepipe.transform(data.toDate, 'yyyy-MM-dd HH:mm');

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
      data.fromDate = this.datepipe.transform(data.fromDate, 'yyyy-MM-dd') ;
      data.toDate = this.datepipe.transform(data.toDate, 'yyyy-MM-dd');
      this._commonService.setHttp('get', 'vehicle-tracking/mahakhanij/get-material-order-enquiry?UserId=' + this._commonService.loggedInUserId() + '&fromDate=' + fromDate + '&toDate=' + toDate, true, false , false,'vehicleTrackingBaseUrlApi');
      this._commonService.getHttp().subscribe((res:any) => { 
        if (res.statusCode === "200") {
          this.materialOrderReportDataClone = JSON.parse(JSON.stringify(res.responseData));
          this.materialOrderReportData = Object.assign(res.responseData, this.materialOrderFrom.value);
          this.popUpMaterialDetailsDataClone=res.responseData2;
          this.hideReport = true;
          this.spinner.hide();
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

  clearForm() {
    this.hideReport = false;
    this.materialOrderFrom.reset({
      fromDate: this.defaultFromDate,
      toDate: this.defaultToDate,
    });
  }

  downLoadExcel() {
    let data: any;
    if (this.downloadStatus) {
      data = this.materialOrderReportDataClone.map((x: any) => {
        x.materialOrderDate =  this.datepipe.transform( x.materialOrderDate, 'dd-MM-yyyy hh:mm a');
        this.popUpMaterialDetailsDataClone.forEach((element: any) => {
          if(x.materialOrderId == element.materialOrderId){
            x.quantity =   element.quantity; // add key  quantity
            x.materialName = element.materialName
          }
        });
        return x
      });
      this.downloadStatus = false;
    } else { data = this.materialOrderReportDataClone }
    let keyExcelHeader = ["Sr No."," Date","Name","Project","Mobile No","Material Name","Quantity"];
    let key = ['rowNumber', 'materialOrderDate', 'projectOwnerName', 'projectName','mobileNo1','materialName','quantity'];
    this.materialOrderFrom.value['pageName']="Material Order Enquiry Report";
    let formDataObj:any  =  this.materialOrderFrom.value;
    this._excelService.exportAsExcelFile(keyExcelHeader,key, data,formDataObj);
  }

  downLoadPDF() {
    let data: any;
    if (this.downloadStatus) {
      data = this.materialOrderReportDataClone.map((x: any) => {
        x.materialOrderDate =  this.datepipe.transform( x.materialOrderDate, 'dd-MM-yyyy hh:mm a');
        this.popUpMaterialDetailsDataClone.forEach((element: any) => {
          x.quantity =   element.quantity; // add key  quantity
          x.materialName = element.materialName
        });
        return x
      });
      this.downloadStatus = false;
    } else { data = this.materialOrderReportDataClone }

    let keyPDFHeader = ["Sr No."," Date","Name","Project","Mobile No","Material Name", "Quantity"];
    let key = ['rowNumber', 'materialOrderDate', 'projectOwnerName', 'projectName','mobileNo1',"materialName", 'quantity'];
    this.materialOrderFrom.value['pageName']="Material Order Enquiry Report";
    let formDataObj:any  =  this.materialOrderFrom.value;
    this._excelService.downLoadPdf(keyPDFHeader,key, data,formDataObj);
  }
 

  popUpMaterialDetails(index:any){
    this.popUpMaterialDetailsData= this.materialOrderReportData[index];
    this.rowNumber=this.popUpMaterialDetailsData.rowNumber;
    
    this.popUpMaterialDetailsDataClone.forEach((element: any) => { // get driver name from vehicleNo
    if (element.materialId == this.popUpMaterialDetailsData.materialId) {
        this.materialName = element.materialName;
        this.quantity = element.quantity;
    }
    });
    
    }

}
