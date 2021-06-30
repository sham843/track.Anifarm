import { AfterViewInit, Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { LatLngBounds, MapsAPILoader } from '@agm/core';
import { Router } from '@angular/router';
import { CommonService } from 'src/app/services/common.service';
import { ToastrService } from 'ngx-toastr';
import { NgxSpinnerService } from 'ngx-spinner';
import { interval, timer } from 'rxjs';
import { Renderer2 } from '@angular/core';
import { FormBuilder, FormGroup, NumberValueAccessor, Validators } from '@angular/forms';
import { switchMap, take } from 'rxjs/operators';
import { DatePipe } from '@angular/common';
declare var google: any;

@Component({
  selector: 'app-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.css']
})
export class MapComponent implements OnInit, AfterViewInit, OnDestroy {
  userid = JSON.parse(localStorage.loggedInDetails).responseData[0].id
  showSidebar: boolean = true;
  position = [18.489585, 73.8578095];
  GpsStatus: string = '';
  liActive: any;
  VehiclecurrentLocation: string = '';
  sel_VehicleObj = {}
  drawPolyline: any = [];
  sel_Vehicle = ''
  checkStatus: any;
  rngSlider: any;
  // lat = 51.678418;
  // long = 7.809007;
  zoom: number = 6;
  lat = 19.7515;
  long = 75.7139;
  submitted = false;
  viewType: any = 'roadmap';
  getSelStatus: any;
  trafficLignClass: boolean = false;
  defaultHide: boolean = false;;
  fuelInLiter = 0;
  isFuelApplicable: boolean = false;
  deviceDateTime: string = '';
  isSinglemarker: boolean = false;
  User: string = '';
  Speed: number = 0;
  map: any;
  trafficLayer: any;
  chart: any
  cardMap: any;
  crosshairs: any;
  Sel_vehicleTypeImage: any;
  latitude = 0;
  longitude = 0;
  intrvaltime = 29
  tempInterval: number = 29;
  intrvaltimeOnchange: number = 29;
  VehicleDtArr: any = [{ driverName: '', vehicleNo: '', driverMobileNo: '', vehicleTypeImage: 'BargeR.png', latitude: 0, longitude: 0 }];
  VehicleMarkerArr: any = [{ driverName: '', vehicleNo: '', driverMobileNo: '', vehicleTypeImage: 'BargeR.png', latitude: 0, longitude: 0 }];
  isPlay = true;
  RunningTime: any;
  StopageTime: any;
  IdleTime: any;
  MaxSpeed: any;
  TravelledDistance: any;
  StartAddress: string = '';
  EndAddress: string = '';
  tempObj: any;
  speedRange: any;
  mapForm!: FormGroup;
  capacity: any;
  fuelType: any;
  VehicleType: any;
  loading: boolean = true;
  Geolocation: any;
  geoCoder: any;
  polyline: any = '';
  polylineArr: any = [];
  isIntrvalNotValid: boolean = false;
  timeInterval: any;
 

  @ViewChild('vehicleInformation')
  vehicleInformation!: ElementRef<HTMLElement>;
  //= new google.maps.Geocoder()

  //= new google.maps.Geocoder()
  constructor(
    private mapsAPILoader: MapsAPILoader,
    private router: Router,
    private CommonService: CommonService,
    private toastrService: ToastrService,
    private spinner: NgxSpinnerService,
    private render: Renderer2,
    private fb: FormBuilder,
    public date: DatePipe
  ) {
    this.router.getCurrentNavigation();
    this.getSelStatus = this.router.getCurrentNavigation()?.extras.state;
    this.checkStatus = this.getSelStatus?.example;
    if (this.checkStatus == '' || this.checkStatus == null) {
      this.checkStatus = "select";
    }
  }

  ngOnInit(): void {
    this.mapsAPILoader.load().then(() => {
      this.geoCoder = new google.maps.Geocoder;
    });
    // intrvaltime=30
    let $this = this;

    this.timeInterval = setInterval(() => {
      if (this.isPlay) {
        if (this.intrvaltime <= 1) {
          this.BindVehicleList(this.checkStatus);
          this.intrvaltime = this.tempInterval
        } else {
          --this.intrvaltime
        }
      }
    }, 1000)
    this.defaultMapForm();
  }

  ngAfterViewInit() {
    this.BindVehicleList(this.checkStatus);
  }

  defaultMapForm() {
    this.mapForm = this.fb.group({
      vehicleMake: ['', Validators.required],
      vehicleModels: ['', Validators.required],
      vehicleEngineCapacity: ['', Validators.required],
      deviceId: ['', Validators.required],
      deviceSIMNo: ['', Validators.required],
      fuelTypeId: ['', this.validfuelTypeId],
      vehicleTypeId: ['', Validators.required],
      speed: ['', Validators.required],
    })
  }

  fillVechData(vechData: any) {
    this.speedRange = vechData.overspeedLimit
    this.mapForm.patchValue({
      vehicleMake: vechData.vehicleMake,
      vehicleModels: vechData.vehicleModels,
      vehicleEngineCapacity: vechData.vehicleEngineCapacity,
      deviceId: vechData.deviceId,
      deviceSIMNo: vechData.deviceSIMNo,
      fuelTypeId: vechData.fuelTypeId,
      vehicleTypeId: vechData.vehicleTypeId,
      speed: vechData.speed,

    })
  }


  vechSpeed(event: any) {
    this.speedRange = event.target.value
  }

  get f() { return this.mapForm.controls };



  onSubmit() {
    this.submitted = true;
    // this.spinner.show();

    if (this.mapForm.invalid) {
      this.spinner.hide();
      return;
    } else if (this.mapForm.value.vehicleMake.trim() == "") {
      this.toastrService.error("Vehicle Make is required");
      return;
    } else if (this.mapForm.value.vehicleModels.trim() == "") {
      this.toastrService.error("Vehicle Model is required");
      return;
    } else if (this.mapForm.value.vehicleEngineCapacity.trim() == "") {
      this.toastrService.error("Engine Capacity is required");
      return;
    }
    else {
      // let vehEngCap = this.mapForm.value.vehicleEngineCapacity
      if ((this.mapForm.value.overspeedLimit || this.speedRange) < 20) {
        this.toastrService.error("Over speed limit should be greather than 20")
        return
      }
      if ((this.mapForm.value.vehicleEngineCapacity) < 1) {
        this.toastrService.error("Engine Capacity should be greather than 0")
        return
      }

      let vehicleObj = {
        "id": 0,
        "vehicleId": this.tempObj.vehicleId,
        "vehicleMake": this.mapForm.value.vehicleMake,
        "vehicleModel": this.mapForm.value.vehicleModels,
        "vehicleChassisNo": null,
        "vehicleEngineNo": null,
        "vehicleEngineCapacity": Number(this.mapForm.value.vehicleEngineCapacity),
        "fuelTypeId": this.mapForm.value.fuelTypeId,
        "overspeedLimit": this.mapForm.value.speed,
        "createdBy": this.CommonService.loggedInUserId(),
        "createdDate": new Date(),
        "isDeleted": true,
        "userId": this.CommonService.loggedInUserId(),
        "vehicleTypeId": this.mapForm.value.vehicleTypeId
      }

      this.CommonService.setHttp('post', 'vehicle-tracking/vehicle-list/save-update-vehicle-details', true, vehicleObj, false, 'vehicleTrackingBaseUrlApi');
      this.CommonService.getHttp().subscribe((res: any) => {
        if (res.statusCode === "200") {
          this.toastrService.success(res.statusMessage);
          // this.spinner.hide();
          this.BindVehicleList(null);
          this.submitted = false;
        }
        else if (res.statusCode === "409") {
          // this.spinner.hide();
          this.toastrService.error(res.statusMessage);
        }
        else {
          this.toastrService.error("No data found");
          // this.spinner.hide();
        }
      })
    }
  }


  fnResetCounter(Vstatus: any) {
    this.liActive = '-1'
    this.isPlay = false;
    this.checkStatus = Vstatus;
    this.BindVehicleList(null);
    this.isSinglemarker = false;
    this.sel_Vehicle = '';
    this.polyline && this.polyline.setMap(null);
    this.defaultHide = false;
    this.zoom = 6;
    //if(this.vehicleInformation!=undefined){let el: HTMLElement = this.vehicleInformation.nativeElement;el.click()}
  }

  playPause() { this.isPlay = !this.isPlay; }

  onChange(ev: any) {
    debugger;
    this.isPlay = false;
    this.sel_Vehicle = '';
    this.isSinglemarker = false;
    this.intrvaltime = 29;
    this.checkStatus = ev.target.value;
    this.loading = true;
    this.BindVehicleList(ev.target.value);
    this.loading = false;
    this.liActive = '-1';
    this.defaultHide = false;
    //if(this.vehicleInformation!=undefined){let el: HTMLElement = this.vehicleInformation.nativeElement;el.click()}

  }

  customRange() { }

  FN_fuelType() {
    this.CommonService.setHttp('get', 'vehicle-tracking/mahakhanij/fuel-type', true, false, false, 'vehicleTrackingBaseUrlApi');
    this.CommonService.getHttp().subscribe((responseData: any) => {
      // this.spinner.hide("mySpinner")
      if (responseData.statusCode === "200") {
        this.fuelType = responseData.responseData
      }
    })
  }

  FN_VehicleType() {
    this.CommonService.setHttp('get', 'vehicle-tracking/mahakhanij/vehicle-type', true, false, false, 'vehicleTrackingBaseUrlApi');
    this.CommonService.getHttp().subscribe((responseData: any) => {
      // this.spinner.hide("mySpinner")
      if (responseData.statusCode === "200") {
        this.VehicleType = responseData.responseData
      }
    })
  }
  BindVehicleList(GpsStatus: any | null) {
    this.GpsStatus = GpsStatus == "select" ? null : GpsStatus;
    let param = ''
    param += 'UserId=' + this.userid
    param += this.GpsStatus ? '&&GpsStatus=' + this.GpsStatus : ''
    this.CommonService.setHttp('get', 'vehicle-tracking/tracking/get-vehicles-current-location?' + param, true, false, false, 'vehicleTrackingBaseUrlApi');
    this.CommonService.getHttp().subscribe((responseData: any) => {

      // this.spinner.hide("mySpinner")
      if (responseData.statusCode === "200") {
        this.loading = false;
        this.isPlay = true;//play button
        this.intrvaltime = this.tempInterval//setInterval Timer
        this.VehicleDtArr = responseData.responseData;// for vehicle list left side
        this.VehicleMarkerArr = JSON.parse(JSON.stringify([...this.VehicleDtArr]));//for culstomer marker make diffrent due to the image cant set with concat in marker
        const bounds:any = new google.maps.LatLngBounds();
        let lngth = this.VehicleMarkerArr.length;
        for (var i = 0; i < lngth; i++) {
          if (this.VehicleMarkerArr[i].vehicleTypeImage) {
            // alert(this.VehicleMarkerArr[i].vehicleTypeImage );
            this.VehicleMarkerArr[i].vehicleTypeImage = 'assets/img/VTSicons/' + this.VehicleMarkerArr[i].vehicleTypeImage + 'M.png';
          }
          this.VehicleMarkerArr[i].latitude && bounds.extend(new google.maps.LatLng(this.VehicleMarkerArr[i].latitude, this.VehicleMarkerArr[i].longitude));
        }

        if (this.sel_Vehicle) {
          let SelVehicNewObj = [...this.VehicleMarkerArr].find(object => object['vehicleNo'] == this.sel_Vehicle);
          this.latitude = SelVehicNewObj.latitude
          this.longitude = SelVehicNewObj.longitude
          this.Sel_vehicleTypeImage = SelVehicNewObj.vehicleTypeImage;
          let latlon = new google.maps.LatLng(SelVehicNewObj.latitude, SelVehicNewObj.longitude)
          this.deviceDateTime = SelVehicNewObj.deviceDatetime;
          this.isFuelApplicable = SelVehicNewObj.isFuelApplicable;
          this.fuelInLiter = SelVehicNewObj.fuelInLiter
          this.drawPolyline.push(latlon)
          var lineSymbol = {
            path: 'M 0,-1 0,1',
            strokeOpacity: 1,
            scale: 4
          };
          this.polyline = new google.maps.Polyline({
            map: this.map,
            path: this.drawPolyline,
            icons: [{
              icon: lineSymbol,
              offset: '0',
              repeat: '20px'
            }],
            strokeColor: '#ffc107',
            strokeOpacity: 0,
            strokeWeight: 4
          });
          this.polylineArr.push(this.polyline)
          //const degree = 90;
           const image:any = document.querySelector("img[src='" + SelVehicNewObj.vehicleTypeImage + "']"); // commit sham 23-06-21
           (image == null) ?   '' : this.render?.setStyle(image,'transform',`rotate(${SelVehicNewObj.direction}deg)`); // commit sham 23-06-21

        } else {
          // this.map.fitBounds(bounds);

        }
      }
      else if (responseData.statusCode === "409") {
        alert(responseData.statusMessage);
        //this.activeTripData = [];
        this.VehicleDtArr = []; this.VehicleMarkerArr = [];
      }
      else {
        this.VehicleDtArr = []; this.VehicleMarkerArr = [];
        // this.activeTripData = [];
      }
    },

    );


  }
  onMapReady(map: any) {
    this.map = map;
  }
  onSetTraffic() {
    this.trafficLignClass = !this.trafficLignClass;
    if (this.trafficLignClass) {
      this.trafficLayer = new google.maps.TrafficLayer();
      this.trafficLayer.setMap(this.map);
    }
    else {
      this.trafficLayer.setMap(null);
    }
  }
  toggleClass(data: any) {
    if (data == "chart") {
      this.chart = true;
      document.getElementsByClassName('close')[0].addEventListener("click", () => {
        this.chart = false;
      })
    } else if (data == "cardMap") {
      this.cardMap = !this.cardMap;
    } else if (data == "crosshairs") {
      this.crosshairs = !this.crosshairs;
    }
  }

  FN_mapVehicleClick(dt: any, index: any) {
    this.BindVehicleList(this.checkStatus);
    this.submitted = false;
    this.defaultHide = true;
    this.polyline && this.polyline.setMap(null);
    this.polylineArr.length > 0 && this.polylineArr.map((dt: any) => dt.setMap(null))
    this.liActive = index
    this.isSinglemarker = true;
    this.tempObj = this.VehicleMarkerArr[index];
    // if (dt.gpsStatus == "Offline") {
    //   this.defaultHide = false;
    //   this.toastrService.error("This vechile is offline no data found");
    //   return
    // }
    this.fillVechData(this.tempObj);
    this.FN_fuelType();
    this.FN_VehicleType();
    this.Sel_vehicleTypeImage = this.tempObj.vehicleTypeImage;

    // this.VehicleMarkerArr = [];
    // this.VehicleMarkerArr.push(tempObj)
    this.sel_VehicleObj = this.tempObj
    this.deviceDateTime = dt.deviceDatetime;
    this.isFuelApplicable = dt.isFuelApplicable;
    this.fuelInLiter = dt.fuelInLiter
    this.User = dt.driverName + ' ( ' + dt.driverMobileNo + ' )';
    this.Speed = dt.speed
    this.sel_Vehicle = dt.vehicleNo;
    this.lat = dt.latitude
    this.long = dt.longitude
    this.latitude = dt.latitude;
    this.longitude = dt.longitude;
    this.capacity = dt.capacity

    let latlng = new google.maps.LatLng(dt.latitude, dt.longitude);
    this.map.panTo(latlng);

    this.Geolocation = new google.maps.Geocoder()
    this.drawPolyline = []
    this.drawPolyline.push(latlng)
    //let latlng = {lat: this.currentBusiness.latitude, lng: this.currentBusiness.longitude};
    let that = this;
    this.Geolocation.geocode({ 'location': latlng }, function (results: any) {
      if (results[0]) { that.VehiclecurrentLocation = results[0].formatted_address; }
      else {}
    });
    // this.VehiclecurrentLocation
    this.getVehiclereport(dt.vehicleNo);//bind vehicle report data
    this.zoom = 10
    //set direction of selected vehicle using css rotate
    const image1:any = document.querySelector("img[src='" + this.Sel_vehicleTypeImage + "']");
    (image1 == null) ? '' : this.render?.setStyle(image1, 'transform', `rotate(${this.tempObj.direction}deg)`)   //commit sham 23-06-21
  }
  getVehiclereport(vehicleNo: any | null) {
    // let fromDate:any;
    let today: any = new Date();
    let fromDate: any = new Date(today)
    // fromDate.setDate(fromDate.getDate() - 1)
    // today = (this.date.transform(today, 'YYY-MM-dd HH:mm'))
    // fromDate = (this.date.transform(fromDate, 'YYY-MM-dd HH:mm'))

    today = (this.date.transform(today, 'yyyy-MM-dd HH:mm'))
    fromDate = (this.date.transform(today, 'yyyy-MM-dd' + ' 00:00'))

    this.CommonService.setHttp('get', 'vehicle-tracking/tracking/get-summary-report?VehicleNumber=' + vehicleNo + '&fromDate=' + fromDate + '&toDate=' + today, true, false, false, 'vehicleTrackingBaseUrlApi');
    this.CommonService.getHttp().subscribe((responseData: any) => {
      // this.spinner.hide("mySpinner")
      if (responseData.statusCode === "200") {
        let dataObj = responseData.responseData
        this.RunningTime = dataObj.runningTime;
        this.StopageTime = dataObj.stoppageTime;
        this.IdleTime = dataObj.idleTime;
        this.MaxSpeed = dataObj.maxSpeed;
        this.TravelledDistance = dataObj.travelledDistance;

        this.setCurrentLocation(dataObj.startLatLong, 'startAddress');
        this.setCurrentLocation(dataObj.endLatLong, 'endAddress');
      }
      else if (responseData.statusCode === "409") {
        alert(responseData.statusMessage);
        //this.activeTripData = [];

      }
      else {
        // this.activeTripData = [];
      }
    },
    );
  }
  setCurrentLocation(latlng: any, address: any) {
    if (latlng != null) {
      let splitlatlng = latlng.split(",")
      this.geoCoder.geocode({ 'location': { lat: Number(splitlatlng[0]), lng: Number(splitlatlng[1]) } }, (results: any) => {
        if (address == 'startAddress') {
          this.StartAddress = results[0].formatted_address;
          this.loading = false;
        } else {
          this.EndAddress = results[0].formatted_address;
          this.loading = false;
        }
      });
    }
    else {
      this.StartAddress = "Unknown location";
      this.EndAddress = "Unknown location"
    }
  }
  Settimeintrval(ev: any) {

    if (this.intrvaltimeOnchange < 10) {
      this.isIntrvalNotValid = true;
      this.toastrService.error("Timer second must be greather than 10 second")

    }else  if (this.intrvaltimeOnchange > 60) {
      this.isIntrvalNotValid = true;
      this.toastrService.error("Timer second must be less than 60 second")

    }
     else {
      document.getElementById('closetimerModel')?.click(),
        this.intrvaltime = this.intrvaltimeOnchange;
      this.tempInterval = this.intrvaltimeOnchange;
    }
  }
  ngOnDestroy() {
    if (this.timeInterval) {
      clearInterval(this.timeInterval);
    }
  }

  validfuelTypeId(controls: any) {
    if (controls.value != 0) {
      return null;
    } else {
      return { validfuelTypeId: true }
    }
  }
}
