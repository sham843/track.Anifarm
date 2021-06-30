import { Component, OnInit } from '@angular/core';
import { DatePipe } from '@angular/common';
import { FormBuilder, FormGroup } from '@angular/forms';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { CommonService } from 'src/app/services/common.service';
import { ExcelService } from 'src/app/services/excel_Pdf.service';
import { DateTimeAdapter } from 'ng-pick-datetime';

@Component({
  selector: 'app-payment-history',
  templateUrl: './payment-history.component.html',
  styleUrls: ['./payment-history.component.css']
})
export class PaymentHistoryComponent implements OnInit {

  date = new Date();
  paymentHistoryFrom!: FormGroup;
  hideReport = false;
  paymentHistoryData: any;
  submitted = false;
  maxDateOut = new Date();
  emptyData = true;
  p: number = 1;
  pageSize: number = 10;
  count: any;
  defaultFromDate: any;
  defaultToDate: any;
  paymentDataReport: any;
  selPageNo: any;
  paymentStatus: any;
  txnid: any;
  gstAmount: any
  basicAmount: any
  transactionCost: any
  fromDate: any;
  toDate: any;
  amcTypeId: any;
  selectedTxnId:any;

  constructor(
    private _commonService: CommonService,
    private fb: FormBuilder,
    private spinner: NgxSpinnerService,
    public datepipe: DatePipe,
    private toastrService: ToastrService,
    private _excelService: ExcelService,
    public dateTimeAdapter: DateTimeAdapter<any>,

  ) {
    {
      dateTimeAdapter.setLocale('en-IN');
      this.defaultFromDate = new Date(Date.now() + -7 * 24 * 60 * 60 * 1000);
      this.defaultToDate = new Date();
    }

  }


  ngOnInit(): void {
    this.initPaymentHistoryForm();
  }


  initPaymentHistoryForm() {
    this.paymentHistoryFrom = this.fb.group({
      fromDate: [this.defaultFromDate],
      toDate: [this.defaultToDate],
    })
  }
  get f() { return this.paymentHistoryFrom.controls };

  onSubmit() {
    this.submitted = true;
    if (this.paymentHistoryFrom.invalid) {
      this.hideReport = false;
      this.spinner.hide();
      return;
    }
    else {
      let data: any = this.paymentHistoryFrom.value;
      this.fromDate = this.datepipe.transform(data.fromDate, 'yyyy-MM-dd HH:mm');
      this.toDate = this.datepipe.transform(data.toDate, 'yyyy-MM-dd HH:mm'); //:ss
      let date1: any = new Date(this.fromDate);
      let timeStamp = Math.round(new Date(this.toDate).getTime() / 1000);
      let timeStampYesterday = timeStamp - (168 * 3600);
      let is24 = date1 >= new Date(timeStampYesterday * 1000).getTime();

      if (!is24) {
        this.toastrService.error("Date difference does not exceed 24hr.");
        this.spinner.hide();
        return
      }
      this.spinner.show();
      this.callPaymentHistoryApi();
    }
  }

  callPaymentHistoryApi() {
    this._commonService.setHttp('get', 'vehicle-tracking/mahakhanij/get-vehicle-payment-history?UserId=' + this._commonService.loggedInUserId() + '&FromDate=' + this.fromDate + '&toDate=' + this.toDate, true, false, false, 'vehicleTrackingBaseUrlApi');
    this._commonService.getHttp().subscribe((res: any) => {
      if (res.statusCode === "200") {
        let data = res.responseData
        this.count = res.responseData.length;
        this.paymentDataReport = data;
        this.spinner.hide();
        this.pagination(1)
        this.paymentHistoryData = Object.assign(data, this.paymentHistoryFrom.value);
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

  pagination(pageNo: any) {
    this.selPageNo = pageNo;
  }

  clearForm() {
    this.hideReport = false;
    this.submitted = false;
    this.paymentHistoryFrom.reset({
      fromDate: this.defaultFromDate,
      toDate: this.defaultToDate,
    });
  }

  downLoadExcel() {
    let data: any;
    let cloned = this.paymentDataReport.map((item: any) => Object.assign({}, item));
    data = cloned.map((x: any, i: any) => {
      x.srNo = i + 1
      return x
    });
    let keyExcelHeader = ["Sr No.", "Transaction Id", "Name", "No. of Vehicles", "Vehicle Nos", "Payment Date", "Amount", "Status"];
    let key = ['srNo', 'transactionId', "firstName", "noOfVehicle", "vehicleRegistrationNo", "paymentDate", "amount", "status"];
    this.paymentHistoryFrom.value['pageName'] = "Payment History Report";
    let formDataObj: any = this.paymentHistoryFrom.value;
    this._excelService.exportAsExcelFile(keyExcelHeader, key, data, formDataObj);
  }

  downLoadPDF() {
    let data: any;
    let cloned = this.paymentDataReport.map((item: any) => Object.assign({}, item));
    data = cloned.map((x: any, i: any) => {
      x.srNo = i + 1
      return x
    });
    let keyPDFHeader = ["Sr No.", "Transaction Id", "Name", "No. of Vehicles", "Vehicle Nos", "Payment Date", "Amount", "Status"];
    let key = ['srNo', 'transactionId', "firstName", "noOfVehicle", "vehicleRegistrationNo", "paymentDate", "amount", "status"];
    this.paymentHistoryFrom.value['pageName'] = "Payment History Report";
    let formDataObj: any = this.paymentHistoryFrom.value;
    this._excelService.downLoadPdf(keyPDFHeader, key, data, formDataObj);
  }


  checkPaymentStayus(data: any) {
    this.spinner.show();
    this.selectedTxnId = data.transactionId
    // let transId = '0afb9b99745ba0e0ebe6'; // fail status  data.txnid
    // let transId = '6d6ed7c2ee41f4ca8c8c'; // success status 
    this._commonService.setHttp('post', 'vehicle-tracking/mahakhanij/get-payment-status-by-merchant-transactionids?MerchantTransactionId=' + this.selectedTxnId, true, false, false, 'vehicleTrackingBaseUrlApi');
    this._commonService.getHttp().subscribe((res: any) => {
      if (res.statusCode === "200") {
        this.spinner.hide();
        let resultData = JSON.parse(res.responseData);
        console.log(resultData);
        if (resultData.result != null) {
          let result = resultData.result[0].postBackParam;
          this.paymentStatus = result.status; // check payment status
          this.txnid = result.txnid; // check payment txnid
          let amounts = result.udf5.split("$");
          this.amcTypeId = amounts[0];
          this.basicAmount = amounts[1];
          this.gstAmount = amounts[2];
          this.transactionCost = amounts[3];
          if (data.status != this.paymentStatus && data.transactionId == result.txnid) {
            this.vehiclePayment(data)
          }
        }else{
          this.paymentStatus = false;
          this.toastrService.error(resultData.message);
        }
      }
      else if (res.statusCode === "409") {
        this.spinner.hide();
        this.toastrService.error(res.statusMessage);
      }
      else {
        this.toastrService.error("No data found");
        this.spinner.hide();
      }
    })
  }

  vehiclePayment(paymentObj: any) {
    // this.spinner.show();
    let paymentDataObj = {
      "createdThr": paymentObj.createdThr == "Web" ? 2 : 1, //
      "userId": this._commonService.loggedInUserId(),
      "gstNo": paymentObj.gstNo,
      "noOfVehicles": paymentObj.noOfVehicle,
      "paymentAmount": paymentObj.amount,
      "transactionId": paymentObj.transactionId,
      "status": this.paymentStatus,
      "productInfo": paymentObj.productInfo,
      "firstName": paymentObj.firstName,
      "emailId": paymentObj.emailId,
      "mobileNo": paymentObj.mobileNo,
      "mode": paymentObj.mode,
      "error": paymentObj.error,
      "pgType": paymentObj.pgType,
      "bankRefNum": paymentObj.bankRefNum,
      "payuMoneyId": paymentObj.payUMoneyId,
      "additionalCharges": 0,
      "basicAmount": Number(this.basicAmount),
      "gstAmount": Number(this.gstAmount),
      "transactionCost": Number(this.transactionCost),
      "vehicleIds": paymentObj.vehicleIds,
      "amcTypeId": 2
    };
    this._commonService.setHttp('post', 'vehicle-tracking/mahakhanij/save-update-vehicle-payment', true, paymentDataObj, false, 'vehicleTrackingBaseUrlApi');
    this._commonService.getHttp().subscribe((responseData: any) => {
      if (responseData.statusCode === "200") {
        this.defaultFromDate = new Date(Date.now() + -7 * 24 * 60 * 60 * 1000);
        this.defaultToDate = new Date();
        this.callPaymentHistoryApi();
        this.toastrService.success(responseData.responseData.msg);
        this.spinner.hide();
      }
      else if (responseData.statusCode === "409") {
        alert(responseData.statusMessage);
      }
      else {
      }
    },
    );
  }
}

