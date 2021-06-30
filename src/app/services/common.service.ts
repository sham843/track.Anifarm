import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { DatePipe } from '@angular/common';
import { Router } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';


@Injectable({
  providedIn: 'root'
})
export class CommonService {
  UserLoginDetails: any;
  userObj: any;

  getBaseurl(url: string) {
    switch (url) {
      case 'vehicleTrackingBaseUrlApi': return 'http://vehicle-tracking.eanifarm.com/'; break;
      case 'stplVtsTrackingBaseUrlAPI': return 'http://vts-listener.eanifarm.com/'; break;
      default: return ''; break;
    }
  }
  private httpObj: any = {
    type: '',
    url: '',
    options: Object
  };
  clearHttp() {
    this.httpObj.type = '';
    this.httpObj.url = '';
    this.httpObj.options = {};
  }
  constructor(private http: HttpClient, private datepipe: DatePipe, private router: Router, private spinner:NgxSpinnerService) { }

  getLocalStorageData() {
    let loginObj = JSON.parse(localStorage.loggedInDetails).responseData[0];
    return loginObj;
  }

  userRole() { // get user role name from localstorage
    let userType = this.getLocalStorageData();
    return userType.userType;
  }

  loggedInUserId() {
    let userId = this.getLocalStorageData();
    return userId.id;
  }

  loggedInUsername() {
    let userName = this.getLocalStorageData();
    return userName.name;
  }

  loggedInUserMobile() {
    let usermobileNo = this.getLocalStorageData();
    return usermobileNo.mobileNo1
  }

  getVehicleOwnerId() {
    let vehOwnerId = this.getLocalStorageData();
    return vehOwnerId.vehicleOwnerId
  }

  tokenExpireDateTime() {
    let loginObj = JSON.parse(localStorage.loggedInDetails).responseData3;
    return loginObj.accessTokenExpires;
    // return vehOwnerId.vehicleOwnerId
  }

  tokenExpireRefreshString() {
    let loginObj = JSON.parse(localStorage.loggedInDetails).responseData3;
    return loginObj.refreshToken.tokenString;
    // return vehOwnerId.vehicleOwnerId
  }

  getHttp(): any {
    let temp: any = undefined;
    !this.httpObj.options.body && (delete this.httpObj.options.body)
    !this.httpObj.options.params && (delete this.httpObj.options.params)
    return this.http.request(this.httpObj.type, this.httpObj.url, this.httpObj.options);
  }

  setHttp(type: string, url: string, isHeader: Boolean, obj: any, params: any, baseUrl: any) {
    isHeader = false;
    // check user is login or not 
    let checkLOginData = localStorage.getItem('loggedInDetails');

    if (checkLOginData) {
      // this.tokenExpiredAndRefresh();
    }
    try {
      this.userObj = JSON.parse(localStorage.loggedInDetails);
      // this.UserLoginDetails = JSON.parse(localStorage.loggedInDetails);
    } catch (e) { }
    this.clearHttp();
    this.httpObj.type = type;
    this.httpObj.url = this.getBaseurl(baseUrl) + url;
    if (isHeader) {
      let tempObj: any = {
        "Authorization": "Bearer " + this.userObj.responseData3.accessToken // token set
      };
      // if (this.UserLoginDetails && type !== 'get') {
      //   tempObj.UserId = this.UserLoginDetails.responseData[0].id;
      //   tempObj.UserType = this.UserLoginDetails.responseData[0].userType;
      // }
      this.httpObj.options.headers = new HttpHeaders(tempObj);
    }

    if (obj !== false) {
      this.httpObj.options.body = obj;
    }
    else {
      this.httpObj.options.body = false;
    }
    if (params !== false) {
      this.httpObj.options.params = params;
    }
    else {
      this.httpObj.options.params = false;
    }

  }


  getAddress(cr: any, i: any) {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        let geocoder: any = new google.maps.Geocoder;
        var latlng = { lat: parseFloat(cr.latitude), lng: parseFloat(cr.longitude) };
        geocoder === undefined && (geocoder = new google.maps.Geocoder())
        geocoder.geocode({ 'location': latlng }, (results: any, status: any) => {
          let tempObj: any = new Object();
          tempObj = { ...cr }
          Object.keys(cr).map(function (p) { tempObj[p] = cr[p]; });
          if (status === 'OK') {
            if (results[0]) {
              var address = results.length === 0 ? "Unknown location" : results[0].formatted_address;
              tempObj.address = address;
              resolve(tempObj);
            } else {
              tempObj.address = "Unknown location";
              resolve(tempObj);
            }
          } else {
            tempObj.address = "Unknown location";
            resolve(tempObj);
          }
        })
      }, 200 * i)
    });
  }

  tokenExpiredAndRefresh() {
    let tokenExpireDateTime: any = this.datepipe.transform(this.tokenExpireDateTime(), 'dd-MM-YYYY HH:mm');
    let currentDateTime: any = this.datepipe.transform(new Date(), 'dd-MM-YYYY HH:mm');
    if (tokenExpireDateTime >= currentDateTime) {
    // if (tokenExpireDateTime <= currentDateTime) {
    } else {
      this.spinner.hide();
      let tokenRefreshModelOpen: any = document.querySelector('[data-target="#tokenRefresh"]');  // open  token refresh model
      tokenRefreshModelOpen.click();
    }
  }

  getResponsePay(obj: any) {
    // const headers = new HttpHeaders({
    //   'Authorization': '7/C4OzEHUJzwfCRaWTaKyIHapJfDClUX8GNaMX+4yiA=',
    // })
    // // https://www.payumoney.com/payment/payment/chkMerchantTxnStatus   //Production URL
    // // https://www.payumoney.com/payment/op/getPaymentResponse   //live UR
    // let url = `https://www.payumoney.com/payment/op/getPaymentResponse`;
    // url = `${url}?merchantKey=${obj.merchantKey}&merchantTransactionIds=${obj.merchantTransactionIds}`;
    // return this.http.post(url, {
    //   headers: {
    //     'authorization': '7/C4OzEHUJzwfCRaWTaKyIHapJfDClUX8GNaMX+4yiA=',
    //   }
    // })
  }
}
