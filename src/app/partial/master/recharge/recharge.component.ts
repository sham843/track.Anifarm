import { Component, OnInit, ViewChild, Inject, Renderer2, AfterViewInit } from '@angular/core';
import { CommonService } from 'src/app/services/common.service';
import { NgxSpinnerService } from 'ngx-spinner';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { ActivatedRoute, Router } from '@angular/router';
import { DatePipe } from '@angular/common';
declare var bolt: any;
declare var $: any;

@Component({
  selector: 'app-recharge',
  templateUrl: './recharge.component.html',
  styleUrls: ['./recharge.component.css']
})
export class RechargeComponent implements OnInit, AfterViewInit {
  VehicleListRes: any;
  vechileOwnerInfo: any
  p = 1;
  continueFlag: boolean = true;
  makePaymentForm!: FormGroup;
  submitted: boolean = false;
  vehicleOwnerName: any;
  vehicleOwnerMobileNo: any;
  no = 2;
  basicAmount: any;
  GST: any;
  transactionCost: any;
  PayableAmount: any;
  cheArray: any = [];
  hash: any
  key: any;
  salt: any;
  tranId: any;
  getData: any;
  modalFalg: boolean = false;
  @ViewChild('payuFormSubmit') payuFormSubmit: any;
  @ViewChild('mdlConfirmOpen') mdlConfirmOpen: any;
  udf2: any;
  udf3: any;
  udf4: any;
  udf5: any;
  boltResponse: any;
  sUrl: any;
  totalAmount: any;
  vehicleNo: any;
  vehicleNames: any = [];
  paymentDataObj: any;


  constructor(private _commonService: CommonService,
    private spinner: NgxSpinnerService,
    private fb: FormBuilder,
    private toastrService: ToastrService,
    private router: Router,
    private datepipe: DatePipe
  ) {

  }

  ngOnInit(): void {
    let sessionData = this._commonService.getLocalStorageData();
    this.vehicleOwnerName = sessionData.vehicleOwnerName;
    this.vehicleOwnerMobileNo = sessionData.vehicleOwnerMobileNo;
    this.getVenicleList();
    this.customForm();
  }

  ngAfterViewInit() {
    $(function () {
      $('[data-toggle="tooltip"]').tooltip()
    })
  }

  getVenicleList() {
    this.spinner.show();
    this._commonService.setHttp('get', 'vehicle-tracking/mahakhanij/get-vehicle-payment?UserId=' + this._commonService.loggedInUserId() + "&RateTypeId=" + 2, true, false, false, 'vehicleTrackingBaseUrlApi');
    this._commonService.getHttp().subscribe((responseData: any) => {
      if (responseData.statusCode === "200") {
        this.spinner.hide();
        this.VehicleListRes = responseData.responseData;
        this.vechileOwnerInfo = responseData.responseData1[0];
        console.log(this.vechileOwnerInfo);
        this.key = responseData.responseData2[0].key;
        this.salt = responseData.responseData2[0].salt;
        this.sUrl = responseData.responseData2[0].responseUrl;
      }
      else if (responseData.statusCode === "409") {
        alert(responseData.statusMessage);
      }
      else {
        this.toastrService.error('Data not found');
      }
    },
    );
  }

  customForm() {
    this.makePaymentForm = this.fb.group({
      firstName: [this.vehicleOwnerName],
      mobileNo: [this.vehicleOwnerMobileNo],
      emailId: ['', [Validators.required]],
      gstNo: ['', Validators.pattern("^([0][1-9]|[1-2][0-9]|[3][0-7])([a-zA-Z]{5}[0-9]{4}[a-zA-Z]{1}[1-9a-zA-Z]{1}[zZ]{1}[0-9a-zA-Z]{1})+$")],
    })
  }

  checkBox(data: any, vechId: any, vechNo: any) {
    let checked = data.target.checked;
    let prevIndex = data.target.value;
    let selIndex = prevIndex - 1;
    if (checked) {
      this.VehicleListRes['checked'] = true;
      this.cheArray.push({ 'rNo': Number(data.target.value), 'vechId': vechId, 'vechNo': vechNo });
      this.VehicleListRes[selIndex].checkBoxStatus = true;
      this.vehicleNames.push(vechNo);
    }
    else {
      this.VehicleListRes[selIndex].checkBoxStatus = false;
      this.cheArray = this.cheArray.filter((item: any) => item.rNo != prevIndex);
      this.vehicleNames = this.cheArray.map((ele: any) => {
        return ele.vechNo;
      });
      // let rwoNo = this.cheArray.indexOf(Number(prevIndex));
      // this.cheArray.splice(rwoNo, 1);
    }
    this.vehicleNo = this.cheArray.map((ele: any) => { // vechile no set in localstorage
      return ele.vechNo
    });
  }

  get f() { return this.makePaymentForm.controls };

  continue() {
    if (this.cheArray.length == 0) {
      this.toastrService.error("Select atleast one vehicle");
    } else {
      this.continueFlag = false;
      this.rechargeCal(this.vechileOwnerInfo);
    }
  }

  refresh() {
    this.getVenicleList();
    this.submitted = false;
    this.cheArray = [];
    this.makePaymentForm.reset({
      firstName: this.vehicleOwnerName,
      mobileNo: this.vehicleOwnerMobileNo,
    })
  }

  rechargeCal(data: any) {
    this.basicAmount = Math.round(data.rate * this.cheArray.length);
    this.GST = Math.round(this.basicAmount / 100) * data.gst;
    this.transactionCost = Math.round((this.basicAmount + this.GST) * data.transactionPercentage) / 100;
    this.PayableAmount = this.basicAmount + this.GST + this.transactionCost;
    this.totalAmount = Math.round(this.PayableAmount * 100) / 100;
    // this.totalAmount  = 1
  }

  back() {
    this.continueFlag = true;
  }

  onSubmit() {
    this.submitted = true;
    if (this.makePaymentForm.invalid) {
      this.spinner.hide();
      return;
    } else {
      if (this.makePaymentForm.value.gstNo == "") {
        let modalOPen: HTMLElement = this.mdlConfirmOpen.nativeElement;
        modalOPen.click();
      }
      else {
        this.callHashApi();
      }
    }
  }

  submit() {
    this.callHashApi();
  }

  callHashApi() {
    this.modalFalg = true;
    let data = this.makePaymentForm.value;
    this.getData = data;
    let selVehicleIds = this.cheArray.map((item: any) => {
      let vechId = item.vechId;
      return vechId;
    });

    this.udf2 = (this._commonService.loggedInUserId()).toString();
    this.udf3 = selVehicleIds.toString();
    this.udf4 = this.makePaymentForm.value.gstNo ? this.makePaymentForm.value.gstNo :  '';
    this.udf5 = this.cheArray.length + `$` + this.basicAmount + `$` + this.GST + `$` + this.transactionCost;

    let obj = {
      "amount": this.totalAmount.toString(),
      "firstname": data.firstName,
      "email": data.emailId,
      "phone": data.mobileNo,
      "productinfo": "vtsamc",
      "service_provider": "payu_paisa",
      "lastname": "",
      "address1": "",
      "address2": "",
      "city": "",
      "state": "",
      "country": "",
      "zipcode": "",
      "udf1": "2", // for web
      "udf2": this.udf2, // login Userid
      "udf3": this.udf3, // Vehicle Ids
      "udf4": this.udf4, // Gst No (Not Mandatory)
      "udf5": this.udf5, // Total Count Of Vechicle Selected + Basic Amount + Gst Amount + Transaction Cost
      "udf6": "",
      "udf7": "",
      "pg": "1"
    }
    this.spinner.show();
    this._commonService.setHttp('post', 'vehicle-tracking/mahakhanij/generate-hash-sequence', true, obj, false, 'vehicleTrackingBaseUrlApi');
    this._commonService.getHttp().subscribe((res: any) => {
      if (res.statusCode === "200") {
        this.hash = res.responseData.hash;
        this.tranId = res.responseData.transactionId;
        if (this.hash != null && this.tranId != null) {
          this.vehiclePaymentOrder(obj);
          this.spinner.hide();
        }
      }
      else if (res.statusCode === "409") {
        alert(res.statusMessage);
        this.spinner.hide();
      }
      else {
        this.spinner.hide();
      }
    },
    );
  }

  //------------------ Payu Money Bolt For Vehicle Payment Order Created Method ---------------------------//

  vehiclePaymentOrder(obj: any) {
    this.spinner.show();
    let orderObj = {
      "createdThr": 2,
      "userId": Number(obj.udf2),
      "vehicleOwnerId": this._commonService.getVehicleOwnerId(),
      "gstNo": this.udf4,
      "noOfVehicle": this.cheArray.length,
      "paymentAmount": this.totalAmount,
      "trasnsactionId": this.tranId,
      "status": "pending",
      "productInfo": "vtsamc",
      "firstName": obj.firstname,
      "emailId": obj.email,
      "mobileNo": this._commonService.loggedInUserMobile(),
      "basicAmount": this.basicAmount,
      "gstAmount": this.GST,
      "transactionCost": this.transactionCost,
      "vehicleIds": obj.udf3,
      "amcTypeId": this.vechileOwnerInfo.amcTypeId
    }
    this._commonService.setHttp('post', 'vehicle-tracking/mahakhanij/save-update-vehicle-payment-order', true, orderObj, false, 'vehicleTrackingBaseUrlApi');
    this._commonService.getHttp().subscribe((responseData: any) => {
      if (responseData.statusCode === "200") {
        this.toastrService.success("Order Created Successfully"); //responseData.responseData.msg
        this.launchBoltPayment(); //  Launch Bolt
        this.spinner.hide();
      }
      else if (responseData.statusCode === "409") {
        this.toastrService.error(responseData.statusMessage);
      }
      else {
        this.toastrService.error('Data not found');
      }
    },
    );
  }

  //------------------ Payu Money Bolt For Vehicle Payment Success Or Failure Method ---------------------------//

  vehiclePayment(paymentObj: any) {
    this.spinner.show();
    this.paymentDataObj = {
      "createdThr": 2,
      "userId": this._commonService.loggedInUserId(),
      "gstNo": this.udf4,
      "noOfVehicles": this.cheArray.length,
      "paymentAmount": Number(paymentObj.amount),
      "transactionId": paymentObj.txnid,
      "status": paymentObj.status,
      "productInfo": paymentObj.productinfo,
      "firstName": paymentObj.firstname,
      "emailId": paymentObj.email,
      "mobileNo": paymentObj.phone,
      "mode": paymentObj.mode,
      "error": paymentObj.error,
      "pgType": paymentObj.PG_TYPE,
      "bankRefNum": paymentObj.bank_ref_num,
      "payuMoneyId": paymentObj.payuMoneyId,
      "additionalCharges": 0,
      "basicAmount": this.basicAmount,
      "gstAmount": this.GST,
      "transactionCost": this.transactionCost,
      "vehicleIds": this.udf3,
      "amcTypeId": this.vechileOwnerInfo.amcTypeId
    };

    this._commonService.setHttp('post', 'vehicle-tracking/mahakhanij/save-update-vehicle-payment', true, this.paymentDataObj, false, 'vehicleTrackingBaseUrlApi');
    this._commonService.getHttp().subscribe((responseData: any) => {
      if (responseData.statusCode === "200") {
        // this.toastrService.success(responseData.responseData.msg);
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

  //------------------ Payu Money Bolt Launch For Vehicle Recharge Payment ---------------------------//

  launchBoltPayment() {
    this.spinner.show();
    let obj = {
      "key": this.key,
      "txnid": this.tranId,
      "amount": this.totalAmount.toString(),
      "firstname": this.getData.firstName,
      "email": this.getData.emailId,
      "phone": this.getData.mobileNo,
      "productinfo": "vtsamc",
      "hash": this.hash,
      "udf1": "2", // for web
      "udf2": this.udf2, // login Userid
      "udf3": this.udf3, // Vehicle Ids
      "udf4": this.udf4, // Gst No (Not Mandatory)
      "udf5": this.udf5, // Total Count Of Vechicle Selected + Basic Amount + Gst Amount + Transaction Cost
      "surl": this.sUrl,
      "furl": this.sUrl,

    }
    if (Object.keys(obj).length !== 0) {
      this.spinner.hide();
      bolt.launch(obj, {
        responseHandler: (BOLT: any) => {
          if (BOLT.response.txnStatus != "CANCEL") {
            this.boltResponse = BOLT.response;
            this.boltResponse['vechileNo'] = this.vehicleNo;
            this.boltResponse['GSTNo'] = this.udf4;
            this.boltResponse['GSTPer'] = this.vechileOwnerInfo.gst;
            this.boltResponse['transactionPer'] = this.vechileOwnerInfo.transactionPercentage;
            localStorage.setItem("payment", JSON.stringify(BOLT.response));
            if (this.boltResponse.status == "success" || this.boltResponse.status == "failure") {
              this.vehiclePayment(this.boltResponse);
              this.router.navigate(['../payment']);
            }
          } else {
            let failResObj: any = obj;
            failResObj['status'] = 'failure';
            failResObj['vechileNo'] = this.vehicleNo;
            failResObj['GSTNo'] = this.udf4;
            failResObj['GSTPer'] = this.vechileOwnerInfo.gst;
            failResObj['transactionPer'] = this.vechileOwnerInfo.transactionPercentage;
            this.vehiclePayment(failResObj);
            this.refresh();
            this.back();
            this.toastrService.error("Payment cancelled by user");
          }
          return BOLT.response;
        },
        catchException: (BOLT: any) => {
          this.toastrService.error(BOLT.message);
        }
      });
    } else {
      this.toastrService.error('Something went wrong please try again. Try again');
    }
  }
}
