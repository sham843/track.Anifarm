import { DatePipe } from '@angular/common';
import { Component, NgZone, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { CommonService } from 'src/app/services/common.service';
import { ExcelService } from 'src/app/services/excel_Pdf.service';
import { MapsAPILoader } from '@agm/core';
import { number } from '@amcharts/amcharts4/core';
import { DateTimeAdapter } from 'ng-pick-datetime';

@Component({
    selector: 'app-trip',
    templateUrl: './trip.component.html',
    styleUrls: ['./trip.component.css'],
    providers: [DatePipe]
})
export class TripComponent implements OnInit {
    yesterdayDate: any;
    select: boolean = false;
    tripFrom!: FormGroup;
    date: any = new Date();
    vechileList: any;
    hideReport = false;
    tripReportData: any;
    vehName: any;
    printBtn: boolean = false;
    submitted = false;
    maxDateOut: any = new Date();
    emptyData = true;
    p: number = 1;
    pageSize: number = 10;
    count: any;
    hideDateDiv = true;
    TripArray = ["Trip", "24hr", "Weekly"];
    dateTimeDiv: boolean = false;
    geoCoder: any;
    addressStart: any;
    addressEnd: any;
    latlngStart: any;
    latlngEnd: any;
    tripReportDataClone: any;
    defaultFromDate = new Date(Date.now() + -7 * 24 * 60 * 60 * 1000);
    defaultToDate = new Date();
    tripFlag: boolean = false;
    weekRepFlag: boolean = false;
    downloadStatus: boolean = true;
    tripReportData1: any;
    tripReportDataReport: any = [];
    addressflag: boolean = true;
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

        private ngZone: NgZone,
    ) { { dateTimeAdapter.setLocale('en-IN') } }

    ngOnInit(): void {
        this.mapsAPILoader.load().then(() => {
            this.geoCoder = new google.maps.Geocoder;
        });
        this.customForm();
        this.getVehiclesList();
        this.mapsAPILoader.load().then(() => {
            this.geoCoder = new google.maps.Geocoder;
        });
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
        this.tripFrom = this.fb.group({
            VehicleNumber: ['', Validators.required],
            fromDate: [this.defaultFromDate],
            toDate: [this.defaultToDate],
            tripFormate: ["Trip", Validators.required],
        })
    }

    get f() { return this.tripFrom.controls };

    onSubmit() {

        this.submitted = true;

        this.vechileList.forEach((element: any) => { // get driver name from vehicleNo
            if (element.vehicleNo == this.tripFrom.value.VehicleNumber) {
                this.vehName = element.vehTypeName;
            }
        });

        let driversData = { // driver name obj
            vehTypeName: this.vehName
        };

        if (this.tripFrom.invalid) {
            this.hideReport = false;
            this.spinner.hide();
            return;
        }
        else {
            let data = this.tripFrom.value;
            let fromDate: any = this.datepipe.transform(data.fromDate, 'yyyy-MM-dd HH:mm');
            let toDate: any = this.datepipe.transform(data.toDate, 'yyyy-MM-dd HH:mm');



            if (data.tripFormate == "24hr") {
                this.tripFlag = true;
                this.weekRepFlag = false;
                this.yesterdayDate = new Date(Date.now() + -1 * 24 * 60 * 60 * 1000);
                this.tripFrom.controls['fromDate'].setValue(this.yesterdayDate);
                this._commonService.setHttp('get', 'vehicle-tracking/tracking/get-trip-report-web?UserId=' + this._commonService.loggedInUserId() + '&VehicleOwnerId=' + this._commonService.getVehicleOwnerId() + '&VehicleNumber=' + data.VehicleNumber + '&fromDate=' + this.datepipe.transform(this.yesterdayDate, 'yyyy-MM-dd HH:mm') + '&toDate=' + toDate, true, false, false, 'vehicleTrackingBaseUrlApi');
            }else  if (data.tripFormate == "Trip") {
                this.tripFlag = true;
                this.weekRepFlag = false;
                this.yesterdayDate = new Date();
                this.tripFrom.controls['fromDate'].setValue(this.yesterdayDate);
                this._commonService.setHttp('get', 'vehicle-tracking/tracking/get-trip-report-web?UserId=' + this._commonService.loggedInUserId() + '&VehicleOwnerId=' + this._commonService.getVehicleOwnerId() + '&VehicleNumber=' + data.VehicleNumber + '&fromDate=' + this.datepipe.transform(this.yesterdayDate, 'yyyy-MM-dd 00:00') + '&toDate=' + toDate, true, false, false, 'vehicleTrackingBaseUrlApi');
            }  else if (data.tripFormate == "Weekly") {
                let date1: any = new Date(fromDate);
                let timeStamp = Math.round(new Date(toDate).getTime() / 1000);
                let timeStampYesterday = timeStamp - (168 * 3600);
                let is24 = date1 >= new Date(timeStampYesterday * 1000).getTime();

                if (!is24) {
                    this.toastrService.error("Date difference does not exceed 7 days");
                    this.spinner.hide();
                    return
                }
                this.spinner.show();
                this.defaultFromDate = new Date(Date.now() + -7 * 24 * 60 * 60 * 1000);
                this.tripFlag = false;
                this.weekRepFlag = true;
                this._commonService.setHttp('get', 'vehicle-tracking/tracking/get-weekly-trip-report?UserId=' + this._commonService.loggedInUserId() + '&VehicleOwnerId=' + this._commonService.getVehicleOwnerId() + '&VehicleNumber=' + data.VehicleNumber + '&fromDate=' + fromDate + '&toDate=' + toDate, true, false, false, 'vehicleTrackingBaseUrlApi');
            }
            // this._commonService.setHttp('get', 'vehicle-tracking/tracking/get-trip-report?UserId=' + this._commonService.loggedInUserId() + '&VehicleOwnerId=' + this._commonService.getVehicleOwnerId() + '&VehicleNumber=' + data.VehicleNumber + '&fromDate=' + data.fromDate + '&toDate=' + data.toDate, false, false , false,'vehicleTrackingBaseUrlApi');
            this._commonService.getHttp().subscribe((res: any) => {
                if (res.statusCode === "200") {
                    this.tripReportData1 = res.responseData;
                    this.count = res.responseData.length;
                    // this.tripReportDataClone = JSON.parse(JSON.stringify(res.responseData));
                    this.tripReportData = Object.assign(res.responseData, this.tripFrom.value, driversData);
                    this.hideReport = true;
                    this.spinner.hide();
                    this.pagination(1)


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

    pagination(pageNo: any) { //pagination 
        this.selPageNo = pageNo;
        this.spinner.show();
        let counter;
        let lastIndex: any;
        if (pageNo == 1) {
            counter = 0
            lastIndex = Number(counter) + this.pageSize;
        }
        else {
            counter = Number(pageNo + "0") - this.pageSize;
            lastIndex = pageNo + "0";
        }

        this.tripReportDataReport = [];
        let sliceArray = this.tripReportData1.slice(Number(counter), Number(lastIndex));

        sliceArray.map(async (x: any, i: any) => { //get address by lat & log
            const addressByLatLong = await this.getAddress(x, i);
            this.tripReportDataReport.push(addressByLatLong);
        });
        this.tripReportDataClone = this.tripReportDataReport;

        setTimeout(() => { this.spinner.hide(); }, 2000, true);
    }

    getAddress(cr: any, i: any) { // get address by lat long
        return new Promise((resolve, reject) => {
            let tempObj: any = new Object();
            let splitlatlng:any;
            let splitlatlng1:any;
            setTimeout(() => {
                let geocoder: any = new google.maps.Geocoder;
                tempObj = { ...cr }
                splitlatlng = cr.startLatLong.split(",")
                splitlatlng1 = cr.endLatLong.split(",")
               
                    var latlng = { lat: parseFloat(splitlatlng[0]), lng: parseFloat(splitlatlng[1]) };
                    var latlng1 = { lat: parseFloat(splitlatlng1[0]), lng: parseFloat(splitlatlng1[1]) };
                    geocoder === undefined && (geocoder = new google.maps.Geocoder())
                    geocoder.geocode({ 'location': latlng }, (results: any, status: any) => { // start address 
                        if (status === 'OK') {
                            if (results[0]) {
                                var address = results.length === 0 ? "Unknown location" : results[0].formatted_address;
                                tempObj.startAddress = address
                                resolve(tempObj);
                            } else {
                                 tempObj.startAddress = "Unknown location";
                                resolve(tempObj);
                            }
                        } else {
                             tempObj.startAddress = "Unknown location";
                            resolve(tempObj);
                        }
                        this.addressflag = !this.addressflag;
                    })
                    geocoder.geocode({ 'location': latlng1 }, (results: any, status: any) => { //end addres
                        if (status === 'OK') {
                            if (results[0]) {
                                var address = results.length === 0 ? "Unknown location" : results[0].formatted_address;
                                tempObj.endAddress = address
                                resolve(tempObj);
                            } else {
                                tempObj.endAddress = "Unknown location";
                                resolve(tempObj);
                            }
                        } else {
                            tempObj.endAddress = "Unknown location";
                            resolve(tempObj);
                        }
                        this.addressflag = !this.addressflag;
                    })
                   
            }, 200 * i)
        });
    }



    clearForm() {
        this.submitted = false;
        this.hideReport = false;
        this.select = true;
        this.tripFrom.reset({
            VehicleNumber: '',
            tripFormate: 'Trip',
            toDate: this.defaultToDate,
            fromDate: this.defaultFromDate
        });
        this.onChange('trip');

    }

    onChange(event: any) {
        let gettriptype = event;
        if (gettriptype == "Weekly") {
            this.downloadStatus = true;
            this.tripFrom.controls['fromDate'].setValue(this.defaultFromDate);
            this.dateTimeDiv = true;
        } else {
            this.downloadStatus = true;
            this.tripFrom.controls['fromDate'].setValue(this.yesterdayDate);
            this.dateTimeDiv = false;
        }
    }

    downLoadExcel() {
        let data: any;
        let cloned = this.tripReportDataClone.map((item: any) => Object.assign({}, item));
        data = cloned.map((x: any, i:any) => {
                x.srNo = +(this.selPageNo-1+"0")+i+1
                x.travelledDistance = x.travelledDistance + " Km";
                x.tripDurationInMins = this.datepipe.transform(x.tripDurationInMins * 1000 * 60, 'HH:mm', 'UTC') + " HH:mm";
                x.startDateTime = this.datepipe.transform(x.startDateTime, 'dd-MM-YYYY');
                x.endDateTime = this.datepipe.transform(x.endDateTime, 'dd-MM-YYYY');
                return x;
            });
          

        let keyExcelHeader = ["Sr No.","Distance", "Duration", "Start Date", " Start Address", "End Date", "End Address"];
        let key = ['srNo','travelledDistance', 'tripDurationInMins', 'startDateTime', 'startAddress', 'endDateTime', 'endAddress'];
        this.tripFrom.value['pageName'] = "Trip Report";
        let formDataObj: any = this.tripFrom.value;
        formDataObj['vehName'] = this.vehName;
        this._excelService.exportAsExcelFile(keyExcelHeader, key, data, formDataObj);
    }

    downLoadPDF() {
        let data: any;
        let cloned = this.tripReportDataClone.map((item: any) => Object.assign({}, item));
            data = cloned.map((x: any, i:any) => {
                x.srNo = +(this.selPageNo-1+"0")+i+1
                x.travelledDistance = x.travelledDistance + " Km";
                x.tripDurationInMins = this.datepipe.transform(x.tripDurationInMins * 1000 * 60, 'HH:mm', 'UTC') + " HH:mm";
                x.startDateTime = this.datepipe.transform(x.startDateTime, 'dd-MM-YYYY');
                x.endDateTime = this.datepipe.transform(x.endDateTime, 'dd-MM-YYYY');
                return x
            });
        let keyPDFHeader = ["Sr No.","Distance", "Duration", "Start Date", " Start Address", "End Date", "End Address"];
        let key = ['srNo','travelledDistance', 'tripDurationInMins', 'startDateTime', 'startAddress', 'endDateTime', 'endAddress'];
        this.tripFrom.value['pageName'] = "Trip Report";
        let formDataObj: any = this.tripFrom.value;
        formDataObj['vehName'] = this.vehName;
        this._excelService.downLoadPdf(keyPDFHeader, key, data, formDataObj);
    }




}