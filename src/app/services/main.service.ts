import { Injectable } from '@angular/core';
import { NgxSpinnerService } from 'ngx-spinner';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class MainService {
  codecareerPage:any;
  constructor(public spinner: NgxSpinnerService) { }

  getAddressBylatLong(pageNo: any, data: any, pageSize:any): Observable<any> { //pagination 
    this.spinner.show();
    let counter;
    let lastIndex: any;
    if (pageNo == 1) {
      counter = 0
      lastIndex = Number(counter) + pageSize;
    }
    else {
      counter = Number(pageNo + "0") - pageSize;
      lastIndex = pageNo + "0";
    }

    let getData: any = [];
    let sliceArray = data.slice(Number(counter), Number(lastIndex));
    sliceArray.map(async (x: any, i: any) => { //get address by lat & log
      const addressByLatLong = await this.getAddress(x, i)
      getData.push(addressByLatLong);
    });
    setTimeout(() => { this.spinner.hide(); }, 2000, true);
    return getData;
  }

  getAddress(cr: any, i: any) { // get address by lat long
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

  createCaptchaCarrerPage() {
    //clear the contents of captcha div first
    let id :any = document.getElementById('captcha');
    id.innerHTML = "";

    var charsArray =
    // "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ@!#$%^&*";
    "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
    var lengthOtp = 6;
    var captcha = [];
    for (var i = 0; i < lengthOtp; i++) {
    //below code will not allow Repetition of Characters
    var index = Math.floor(Math.random() * charsArray.length + 1); //get the next character from the array
    if (captcha.indexOf(charsArray[index]) == -1)
    captcha.push(charsArray[index]);
    else i--;
    }
    var canv = document.createElement("canvas");
    canv.id = "captcha1";
    canv.width = 120;
    canv.height = 40;
    //var ctx:any = canv.getContext("2d");
    var ctx:any = canv.getContext("2d");
    ctx.font = "21px Arial";
    ctx.fillText(captcha.join(""), 0, 30);
    // ctx.strokeText(captcha.join(""), 0, 30);
    //storing captcha so that can validate you can save it somewhere else according to your specific requirements
    this.codecareerPage = captcha.join("");
    let appendChild :any = document.getElementById("captcha");
    appendChild.appendChild(canv); // adds the canvas to the body element
    }
    
    checkvalidateCaptcha() {
      return this.codecareerPage;
    }
}
