import { Component, OnInit, NgZone, ElementRef, ViewChild } from '@angular/core';
import { MapsAPILoader, MouseEvent } from '@agm/core';
import { CommonService } from 'src/app/services/common.service';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { MapTypeControlStyle } from '@agm/core/services/google-maps-types';


@Component({
  selector: 'app-poi',
  templateUrl: './poi.component.html',
  styleUrls: ['./poi.component.css']
})

export class PoiComponent implements OnInit {
  classActive: boolean = false;
  mapViewType: any = 'roadmap';
  removeBtnFlag: boolean = false;
  showSidebar: boolean = true;
  mapTypeControl: boolean = true;
  zoomControl: boolean = true;
  fullscreenControl: boolean = true;
  position = [18.489585, 73.8578095];
  rngSlider: any;
  lat: any = 19.75117687556874;
  long: any = 75.71630325927731;
  VehicleDtArr: any
  poiForm!: FormGroup;
  date: any = new Date();
  submitted = false;
  VehicleDetailsData: any;
  p: number = 1;
  title: any;
  circleradius = 1000;
  radius = 400;
  address: any;
  HighlightRow: any;
  zoom: any = 12;
  PoiDetails: any;
  flag: boolean = true;
  id = 0;
  poiGlobalObj: any;
  actionFlag: any = "I"; // I for Insert
  geoCoder: any;
  viewType: boolean = false;
  editselOpt: any;
  customStyle = [];
  isChecked: any;
  @ViewChild('close') close: any;
  todayDate = new Date();
  @ViewChild('search') searchElementRef: any;
  @ViewChild('deleteConfirmOpen') deleteConfirmOpen: any;
  @ViewChild('PoiDetailModelOpen') PoiDetailModelOpen: any;
  delObj: any;

  constructor(
    private mapsAPILoader: MapsAPILoader,
    private spinner: NgxSpinnerService,
    private _commonService: CommonService,
    private toastrService: ToastrService,
    private fb: FormBuilder,
    private ngZone: NgZone
  ) { }


  ngOnInit(): void {
    this.customForm();
    this.getVenicleList();
    this.getVehicleDetails();
    this.mapsAPILoader.load().then(() => {
      this.geoCoder = new google.maps.Geocoder;
      this.getAddress(this.lat, this.long);
    });
    this.searchAutoComplete();
  }

  searchAutoComplete() {
    this.mapsAPILoader.load().then(() => {
      // this.setCurrentLocation();
      this.geoCoder = new google.maps.Geocoder;

      let autocomplete = new google.maps.places.Autocomplete(this.searchElementRef.nativeElement);
      autocomplete.addListener("place_changed", () => {
        this.ngZone.run(() => {
          let place: google.maps.places.PlaceResult = autocomplete.getPlace();

          if (place.geometry === undefined || place.geometry === null) {
            return;
          }

          this.lat = place.geometry.location.lat();
          this.long = place.geometry.location.lng();
          // this.zoom = 12;
          this.getAddress(this.lat, this.long)
        });
      });
    });
  }

  get f() { return this.poiForm.controls };

  customForm() {
    this.poiForm = this.fb.group({
      title: ['', [Validators.required]],
      // , Validators.maxLength(45)
      radius: ['1000', Validators.required],
      vehicleNo: ['', Validators.required],
      address: [''],
    })
  }

  getVenicleList() {
    this._commonService.setHttp('get', 'vehicle-tracking/tracking/get-Vehicle-Details?UserId=' + this._commonService.loggedInUserId(), true, false, false, 'vehicleTrackingBaseUrlApi');
    this._commonService.getHttp().subscribe((responseData: any) => {
      if (responseData.statusCode === "200") {
        this.VehicleDtArr = responseData.responseData;
      }
      else if (responseData.statusCode === "409") {
        alert(responseData.statusMessage);
      }
      else {
      }
    },

    );
  }

  getVehicleDetails() {
    this._commonService.setHttp('get', 'vehicle-tracking/POI/get-POI-vehicle-Details?UserId=' + this._commonService.loggedInUserId() + '&VehicleNumber=' + this.poiForm.value.vehicleNo, true, false, false, 'vehicleTrackingBaseUrlApi');
    this._commonService.getHttp().subscribe((responseData: any) => {
      if (responseData.statusCode === "200") {
        this.VehicleDetailsData = responseData.responseData;
      }
      else if (responseData.statusCode === "409") {
        alert(responseData.statusMessage);
      }
      else {
        this.VehicleDetailsData = [];
        // console.log('Data not found');
      }
    },

    );
  }



  onSubmit() {
    this.submitted = true;
    if (this.poiForm.invalid) {
      this.spinner.hide();
      return;
    } else if (this.poiForm.value.title.trim() == "") {
      this.toastrService.error("Please enter POI title");
      return;
    }
    else {
      let mulVehicleId: any = this.poiForm.value.vehicleNo;
      mulVehicleId = mulVehicleId.toString();
      this.poiGlobalObj = {
        "id": this.id, "vehicleOwnerId": this._commonService.getVehicleOwnerId(), "title": this.poiForm.value.title, "latitude": this.lat, "longitude": this.long, "distance": Number(this.poiForm.value.radius), "poiAddress": this.address, "userId": this._commonService.loggedInUserId(), "createdDate": this.todayDate, "isDeleted": true, "vehicleId": mulVehicleId, "flag": this.actionFlag
      }
      this.editViewDelete(this.poiGlobalObj);
      this.clearForm();
    }

  }

  editViewDelete(poiGlobalObj: any) {
    this._commonService.setHttp('post', 'vehicle-tracking/POI/save-update-POI', true, poiGlobalObj, false, 'vehicleTrackingBaseUrlApi');
    this._commonService.getHttp().subscribe((res: any) => {
      if (res.statusCode === "200") {
        this.removeBtnFlag = false;
        this.getVehicleDetails();
        this.toastrService.success(res.statusMessage);
        this.spinner.hide();
        //  this.submitted = false;
      }
      else if (res.statusCode === "409") {
        this.toastrService.error(res.statusMessage);
      }
      else {
        this.toastrService.error("No data found");
        this.spinner.hide();
      }
    })
  }

  clearForm() {
    this.HighlightRow = null;
    this.submitted = false;
    this.poiForm.reset({
      radius: '1000',
      address: this.address
    });
    this.circleradius = 1000;
    this.radius = 1000;
    this.viewType = false;
    // this.getAddress(this.lat, this.long);
  }

  poiDetailsViewEditDel(index: any, checkFlag: any) {
    this.showSidebar = true;
    if (checkFlag == 'del') {
      let selObj = this.VehicleDetailsData[index];
      this.poiGlobalObj = {
        "id": selObj.id, "vehicleOwnerId": this._commonService.getVehicleOwnerId(), "title": selObj.title, "latitude": selObj.latitude, "longitude": selObj.longitude, "distance": selObj.distance, "poiAddress": selObj.poiAddress, "userId": this._commonService.loggedInUserId(), "createdDate": this.todayDate, "isDeleted": true, "vehicleId": selObj.vehicleId, "flag": 'D'
      }
      this.editViewDelete(this.poiGlobalObj)
      return
    }
    else if (checkFlag == 'view') {
      this.modalClose();
      this.viewType = true;
    }
    else if (checkFlag == 'edit') {
      this.modalClose();
      this.viewType = false;
    }

    this.actionFlag = "U";
    this.removeBtnFlag = true;
    this.HighlightRow = index;
    this.PoiDetails = this.VehicleDetailsData[index];
    this.id = this.PoiDetails.id;
    this.poiForm.patchValue({
      title: this.PoiDetails.title,
      radius: this.PoiDetails.distance,
      address: this.PoiDetails.poiAddress,
      vehicleNo: this.PoiDetails.vehicleId,
    })
    this.circleradius = this.PoiDetails.distance
    this.editselOpt = this.PoiDetails.vehicleId.split(',').map(function (item: any) {
      return Number(item);
    });
  }


  markerDragEnd($event: MouseEvent) {
    this.lat = $event.coords.lat;
    this.long = $event.coords.lng;
    this.getAddress(this.lat, this.long);
  }

  getAddress(lat: number, long: number) {
    this.spinner.show();
    this.geoCoder.geocode({ 'location': { lat: lat, lng: long } }, (results: any, status: any) => {
      if (status === 'OK') {
        if (results[0]) {
          this.spinner.hide();
          // this.zoom = 12;
          this.address = results[0].formatted_address;
        } else {
          this.spinner.hide();
          this.toastrService.error('No results found');
        }
      }
      this.spinner.hide();
    });
  }

  toggleClass() {
    this.classActive = !this.classActive;
  }

  changeMap(mapType: any) {
    // alert(this.isChecked);
    if (mapType == 'map') {
      if (this.isChecked) {
        this.mapViewType = 'terrain';
      } else {
        this.mapViewType = 'roadmap';
      }
    } else if (mapType == 'satellite') {
      if (this.isChecked) {
        this.mapViewType = 'hybrid';
      } else {
        this.mapViewType = 'satellite';
      }
    }
  }

  checkValue(event: any, mapType: any) {
    if (event == 'terrain' && mapType == 'roadmap') {
      this.isChecked = true;
      this.mapViewType = 'terrain';
    } else if (event == 'labels' && mapType == 'terrain') {
      this.isChecked = false;
      this.mapViewType = 'roadmap';
    }
    else if (event == 'terrain' && mapType == 'satellite') {
      this.isChecked = true;
      this.mapViewType = 'hybrid';
    }
    else if (event == 'labels' && mapType == 'hybrid') {
      this.isChecked = false;
      this.mapViewType = 'satellite';
    }
  }

  modalClose() {
    let el: HTMLElement = this.close.nativeElement;
    el.click();
  }

  poiDetailsDelete(index: any, type: any) { // open poi deatails delete confirmation modal
    let el: HTMLElement = this.deleteConfirmOpen.nativeElement;
    el.click();
    this.delObj = { "index": index, "type": type }
  }

  deletePOIdetails() {// Press on delete button
    let poiMoalOpen = this.PoiDetailModelOpen.nativeElement;
    poiMoalOpen.click();
    this.poiDetailsViewEditDel(this.delObj.index, this.delObj.type);
    // this.getVehicleDetails();
  }

  canceldelModal() {
    let poiMoalOpen = this.PoiDetailModelOpen.nativeElement;
    poiMoalOpen.click();
  }
}

