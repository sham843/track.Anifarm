import { Component, OnInit } from '@angular/core';
import { AgmInfoWindow, MapsAPILoader } from '@agm/core';
import { CommonService } from 'src/app/services/common.service';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { TravelMarker, TravelMarkerOptions, TravelData, TravelEvents, EventType } from 'travel-marker';
import { ToastrService } from 'ngx-toastr';
import * as am4core from "@amcharts/amcharts4/core";
import * as am4charts from "@amcharts/amcharts4/charts";
import am4themes_animated from "@amcharts/amcharts4/themes/animated"
import { NgxSpinnerService } from 'ngx-spinner';
import { DatePipe } from '@angular/common';
import { any } from '@amcharts/amcharts4/.internal/core/utils/Array';
import { DateTimeAdapter } from 'ng-pick-datetime';

// import {} from 'googlemaps'                             
declare var google: any;
@Component({
  selector: 'app-tracking',
  templateUrl: './tracking.component.html',
  styleUrls: ['./tracking.component.css']
})
export class TrackingComponent implements OnInit {
  date: any = new Date();
  userid = JSON.parse(localStorage.loggedInDetails).responseData[0].id
  InvoiceData: any = [];
  //public minDate:Date =new Date(this.dateTime.getFullYear()+'-'+(dateTime.getMonth()+1)+'-'+dateTime.getDate())
  lat = 20.879865;
  long = 78.905043;
  speed = 50;
  zoom: number = 12;
  maxDateOut: any = new Date();
  // googleMapType = '';
  toggleControlDiv = false;
  googleMapType = 'satellite';
  VehicleDtArr = [{ vehicleId: '0', vehicleNo: 'Select vehicle' }];
  filterForm: any;
  public directions: any = [];
  public locationData: any = [];
  locationArray = [];
  locationDTArray: any = [{ Scolor: '', latitude: 0, longitude: 0 }];
  map: any;
  line: any;
  directionsService: any;
  marker: any;
  submitted = false;
  fromTime: any;
  geoCoder: any;
  dateTime = new Date();
  // speedMultiplier to control animation speed
  speedMultiplier = 50;
  viewType: any = 'roadmap';  //for default 'hybrid'
  trafficLayer: any;
  trafficLignClass: boolean = false;
  playPauseFlag: boolean = false;
  chart: boolean = false;
  cardMap: boolean = false;
  crosshairs: boolean = false;
  sidebar: boolean = false;
  filterPara: any
  showSidebar: boolean = true;
  rangevalue = 0;
  stepLocationArray: any = 0;
  rangeDate: any;
  hideCardvehicle: boolean = false; isSpeedlineChartbtn: boolean = false;
  activeButton: any = 2;
  VehiclesDetails: boolean = false;
  speedChange: number = 50;
  visible: boolean = true;
  distance: any;
  previous: any;
  mapeInfospeed: any;
  mapeInfoLatitude: any;
  mapeInfoSn: any;
  hideMapInfo: boolean = false;
  trActive: any;
  btnDisPro: boolean = false;
  startMarker: any
  endMarker: any;
  defaultFromDate = new Date(Date.now() + -1 * 24 * 60 * 60 * 1000);
  defaultToDate = new Date();
  getAddressByVec: any;
  loading = false;

  constructor(private mapsAPILoader: MapsAPILoader, private CommonService: CommonService,
    private toastrService: ToastrService, private spinner: NgxSpinnerService,
    public datepipe: DatePipe,
    public dateTimeAdapter: DateTimeAdapter<any>
  ) { { dateTimeAdapter.setLocale('en-IN'); } }

  ngOnInit(): void {
    this.mapsAPILoader.load().then(() => {
      this.geoCoder = new google.maps.Geocoder;
    });
    this.filterForm = new FormGroup({
      Vehicle: new FormControl('', Validators.required),
      fromdate: new FormControl(this.defaultFromDate, Validators.required),
      todate: new FormControl(this.defaultToDate, Validators.required)
    })
    this.CommonService.setHttp('get', 'vehicle-tracking/tracking/get-Vehicle-Details?UserId=' + this.userid, true, false, false, 'vehicleTrackingBaseUrlApi');
    this.CommonService.getHttp().subscribe((responseData: any) => {
      // this.spinner.hide("mdebuggerySpinner")
      if (responseData.statusCode === "200") {
        this.VehicleDtArr = responseData.responseData
      }
      else if (responseData.statusCode === "409") {
        alert(responseData.statusMessage);
        //this.activeTripData = [];
      }
      else {
        // this.activeTripData = [];
      }
    },
      //   error => { 
      //     error
      // //     if (error.status == 401) {
      // //        this.RefreshTokenService.refreshToken().subscribe(dt => {
      // //         if (dt['statusCode'] == 200) { 
      // //           this.RefreshTokenService.resetUserInfo(true, dt['responseData']);
      // //         this.BindActiveTrip();
      // //         } else { } 

      // //         } 
      // //         //error => { 

      // //  // this.RefreshTokenService.resetUserInfo(false, '');
      // // // });
      // //  }
      //  }
    );
  }

  FnClear() {
    this.line && this.line.setMap(null);
    this.startMarker && this.startMarker.setMap(null);
    this.endMarker && this.endMarker.setMap(null);
    this.locationData = [];
    this.directions = [];
    this.marker && this.marker.setMap(null);
  };
  FnClickRefresh() {
    this.hideMapInfo = false;
    this.InvoiceData = [];
    this.VehiclesDetails = false;
    this.submitted = false;
    this.filterForm.reset({
      Vehicle: "",
      fromdate: this.defaultFromDate,
      todate: this.defaultToDate
    });
    this.line && this.line.setMap(null);
    this.startMarker && this.startMarker.setMap(null);
    this.endMarker && this.endMarker.setMap(null);
    this.locationData = [];
    this.directions = [];
    this.marker && this.marker.setMap(null);
    this.hideCardvehicle = false;
    this.isSpeedlineChartbtn = false;
    this.lat = 20.879865;
    this.long = 78.905043;
  }
  get f() { return this.filterForm.controls };

  onMapReady(map: any) {
    this.map = map;
    // this.mockDirections();
  }


  //-----Bind main vehicle gps data-------------
  BindData() {
    this.submitted = true;

    if (this.filterForm.invalid) {
      this.spinner.hide();
      return;
    }
    else {
      this.spinner.show();
      this.filterPara = this.filterForm.value;
      this.filterPara.fromdate = this.datepipe.transform(this.filterPara.fromdate, 'yyyy-MM-dd HH:mm');
      this.filterPara.todate = this.datepipe.transform(this.filterPara.todate, 'yyyy-MM-dd HH:mm');

      let date1: any = new Date(this.filterPara.fromdate);
      let timeStamp = Math.round(new Date(this.filterPara.todate).getTime() / 1000);
      let timeStampYesterday = timeStamp - (24 * 3600);
      let is24 = date1 >= new Date(timeStampYesterday * 1000).getTime();

      if (!is24) {
        this.hideCardvehicle = false;
        this.toastrService.error("Date difference does not exceed 24hr.");
        this.spinner.hide();
        return
      }
      let praram = 'vehicleNumber=' + this.filterPara.Vehicle + '&fromDate=' + this.filterPara.fromdate + '&toDate=' + this.filterPara.todate
      this.CommonService.setHttp('get', 'vts-listener-api/tracking/get-vehicle-tracking?' + praram, true, false, false, 'stplVtsTrackingBaseUrlAPI');
      // this.CommonService.setHttp('get', 'vts-listener-api/tracking/get-vehicle-tracking?' + praram, false, false, false, 'stplVtsTrackingBaseUrlAPI');
      this.CommonService.getHttp().subscribe((responseData: any) => {
        this.bindinvoiceData();
        if (responseData.statusCode === "200") {
          // this.zoom = 12;
          this.hideCardvehicle = true;
          this.locationData;
          responseData.responseData.map((dt: { locationDeviceTimeMap: any; }, i: number) => (
            responseData.responseData.length - 1 > i && (
              this.locationData = i == 0 ? [...dt.locationDeviceTimeMap, ...responseData.responseData[i + 1].locationDeviceTimeMap] : [...this.locationData, ...responseData.responseData[i + 1].locationDeviceTimeMap]
            )));
          this.directions = responseData.responseData.length == 1 ? responseData.responseData[0].locationDeviceTimeMap : this.locationData;
          // this.speed_vs_Time_lineChart(this.directions) //commit by sham 23-06-21
          // this.bindinvoiceData();
             this.spinner.hide();
          // this.rangeArray(this.locationArray.length)
        }
        else if (responseData.statusCode === "404") {
          // alert();
          this.spinner.hide();
          this.toastrService.error(responseData.statusMessage)
        }
        else {
          this.spinner.hide();
          this.toastrService.error(responseData.statusMessage)

        }
      },
      );
    }
  }

  //-------bind invoice Of vehicle --- on serach
  bindinvoiceData() {
    let filterPara = this.filterForm.value;
    let vehicleId = this.VehicleDtArr.filter(dt => dt.vehicleNo == filterPara.Vehicle)[0].vehicleId
    let praram = 'VehicleId=' + vehicleId + '&FromDate=' + filterPara.fromdate + '&ToDate=' + filterPara.todate + ''
    this.CommonService.setHttp('get', 'vehicle-tracking/vehicle-list/get-invoice-data-vehicle-fromdate-todate?' + praram,
      true, false, false, 'vehicleTrackingBaseUrlApi');
    this.CommonService.getHttp().subscribe((responseData: any) => {
      if (responseData.statusCode === "200") {
        this.InvoiceData = responseData.responseData;
        this.mockDirections();
      }
      else if (responseData.statusCode === "404") {
        // alert(responseData.statusMessage);
        this.InvoiceData = [];
        this.mockDirections();
      }
      else {
        this.InvoiceData = [];
        this.mockDirections();
      }
    },
    );

  }

  // mock directions api
  mockDirections() {
    // if (this.locationArray.length != 0) {
    this.locationArray = this.directions.map((lldt: { latitude: any, longitude: any }) => new google.maps.LatLng(lldt.latitude, lldt.longitude));
    const locationArray1 = this.directions.map((lldt: { latitude: any, longitude: any }) => new google.maps.LatLng(lldt.latitude, lldt.longitude));

    this.line = new google.maps.Polyline({
      strokeOpacity: 1,
      path: [],
      map: this.map,
      strokeColor: '#26B86F',
      strokeWeight: 5,
      //editable: false,
    });
    locationArray1.forEach((l: any) => this.line.getPath().push(l));

    let $this = this;
    // this.locationArray.forEach(function(lt:any){
    locationArray1.forEach(function (lt: any) {
      let clr = '#FBB917'
      if ($this.InvoiceData.length > 0) {
        $this.InvoiceData.map(function (dlt: any) {
          let d = new Date(lt.date);
          let d1 = new Date(dlt.validityFrom);
          let d2 = new Date(dlt.validityUpto);
          clr = ((d1 <= d && d <= d2) ? '#26B86F' : '#FBB917');
        });
      }
      $this.line.strokeColor = clr
    });
    // this.locationArray.forEach((l: any) => this.line.getPath().push(l));
    this.lat = this.directions[0].latitude;
    this.long = this.directions[0].longitude

    const start = this.locationArray[0];
    const end = this.locationArray[this.locationArray.length - 1];

    this.endMarker = new google.maps.Marker({ position: end, map: this.map, label: 'E' });
    this.startMarker = new google.maps.Marker({ position: start, map: this.map, label: 'S' });

    let latlng = new google.maps.LatLng(this.lat, this.long);
    this.map.panTo(latlng);
    this.marker && this.marker.setMap(null);
    this.initRoute();
    // }
    // else{
    //   this.spinner.hide();
    // }
  }
  //initialize travel marker
  initRoute() {
    const route = this.line.getPath().getArray(); //this.locationArray
    // options
    const options: TravelMarkerOptions = {
      map: this.map,  // map object
      speed: 50,  // default 10 , animation speed
      interval: 10, // default 10, marker refresh time
      speedMultiplier: this.speedMultiplier,
      cameraOnMarker: true,
      markerType: 'overlay', // 'overlay',  // default: 'default'
      overlayOptions: {
        offsetX: 0, // default: 0, x-offset for overlay
        offsetY: 0, // default: 0, y-offset for overlay
        offsetAngle: 0, // default: 0, rotation-offset for overlay
        imageUrl: 'assets/img/tracking/truckS.png', // image used for overlay
        imageWidth: 30, // image width of overlay
        imageHeight: 30, // image height of overlay
        // scaledSize: new google.maps.Size(48, 48),

      }


    };

    // define marker
    this.marker = new TravelMarker(options);

    // add locations from direction service 
    this.marker.addLocation(route);
    //this.play()

    setTimeout(() => { this.playPause(); this.VehiclesDetails = true; }, 1000);
  }

  toggleClass(data: any) {
    if (data == "sidebar") {
      this.sidebar = !this.sidebar;
    } else if (data == "chart") {
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

  rangeArray(arrLength: any) {
    debugger;
    let speedSetInterval: any = this.distance / this.speed;
    speedSetInterval = Math.round(speedSetInterval);
    this.rangevalue = 0;
    let lngth = this.locationArray.length
    this.locationArray.map((data: any) => {
      setInterval(() => {
        if (this.rangevalue >= lngth) {
          clearInterval()
        } else {
          this.rangeDate = data.date;
          let getPer = (this.rangevalue / (lngth)) * 100;
          this.stepLocationArray = Math.round(getPer);
          this.rangevalue++;
        }
      }, 1000)
    })

  }

  setRangeValue(getValue: any) {
    // this.pause();
    this.rangevalue = getValue.target.value;
    let directionsArraySlice = this.directions.slice(getValue.target.value, this.directions.length + 1);
    this.directions = directionsArraySlice;
  }

  // play animation
  playPause() {
    this.activeButton = this.playPauseFlag ? 1 : 2
    this.playPauseFlag ? this.marker.play() : this.marker.pause();
    this.spinner.hide();
  }



  //  FN_rotateMarker(e) {
  //   try {
  //     var t = "" === e ? 90 : Number(e);
  //     document.querySelector('[src="assets/img/tracking/truckS.png"]').style.transform = "rotate(" + t + "deg)"
  //   } catch (e) { }
  // }



  // // // pause animation
  // pause() {
  //   this.activeButton = 2;
  //   this.marker.pause();
  // }

  // // reset animation
  reset() {
    this.activeButton = 2;
    this.playPauseFlag = true;
    this.activeButton = 1;
    this.marker.reset();
    setTimeout(() => { this.marker.play(); }, 100);
    // this.marker.play();
    // this.speedMultiplier=50;
    // this.speedChange=50;;
    // this.marker.setSpeedMultiplier(this.speedMultiplier);
  }



  onChangeSpeed(e: any) {
    this.speedChange = +e.target.value;
    this.marker.setSpeedMultiplier(this.speedChange);
  }
  maxDate(date: any) {
    var mydate = new Date(date)
    this.fromTime = mydate.toTimeString().slice(0, 5);
    return (mydate.getFullYear().toString() + '-'
      + ("0" + (mydate.getMonth() + 1)).slice(-2) + '-'
      + ("0" + (mydate.getDate() + 1)).slice(-2))
      + 'T' + mydate.toTimeString().slice(0, 5);
  }

  close(event: any) {
    this.hideMapInfo = false;
  }

  mapeInfoBox(index: any) {
    this.loading = true;
    this.trActive = index;
    this.hideMapInfo = true;
    let indexData: any = this.directions[index];
    this.mapeInfospeed = indexData.speed
    this.lat = indexData.latitude
    this.long = indexData.longitude
    this.mapeInfoSn = index + 1;
    this.getAddress(indexData);
    // this.CommonService.getAddress()
  }


  getAddress(data: any) {
    if (data.latitude != null && data.longitude) {
      this.geoCoder.geocode({ 'location': { lat: Number(data.latitude), lng: Number(data.longitude) } }, (results: any) => {
        this.getAddressByVec = results[0].formatted_address;
        this.loading = false;
      });
    }
    else {
      this.getAddressByVec = "Unknown location";
      this.loading = false;
    }
  }


  checkingTime(time: any) {
    var timeParts = time.split(":");
    var timeInMinutes = (timeParts[0] * 60) + timeParts[1];
    return timeInMinutes;
  }


  //--------------------Chart line ------------------
  speed_vs_Time_lineChart(Sdt: any) {
    this.isSpeedlineChartbtn = true;
    // console.log('chartData', Sdt)
    am4core.ready(() => {
      // Themes begin
      am4core.useTheme(am4themes_animated);
      // Themes end
      var chart = am4core.create("linechartdiv", am4charts.XYChart);
      chart.paddingRight = 20;
      let data: any = [];
      let distance = 0
      //var data1 = [];
      Sdt.map((dt: any, i: number) => {
        if (i == 0) {
          distance = 0
        } else {

          if (i == 492) {
          }
          let lat1 = Sdt[i - 1].latitude;
          let lon1 = Sdt[i - 1].longitude;
          let lat2 = dt.latitude;
          let lon2 = dt.longitude;

          var radlat1 = Math.PI * lat1 / 180
          var radlat2 = Math.PI * lat2 / 180
          var radlon1 = Math.PI * lon1 / 180
          var radlon2 = Math.PI * lon2 / 180
          var theta = lon1 - lon2
          var radtheta = Math.PI * theta / 180
          var dist = Math.sin(radlat1) * Math.sin(radlat2) + Math.cos(radlat1) * Math.cos(radlat2) * Math.cos(radtheta);
          dist = Math.acos(dist)
          dist = dist * 180 / Math.PI
          distance += isNaN(dist) ? 0 : (dist * 60 * 1.1515) * 1.609344
        }
        data.push({
          category: this.datepipe.transform(dt.date, 'short'),
          //value: distance ,
          speed: dt.speed,
          distance: distance
        });

      })

      chart.data = data;
      // Create axes
      var categoryAxis = chart.xAxes.push(new am4charts.CategoryAxis());
      categoryAxis.dataFields.category = "category";
      // categoryAxis.renderer.minGridDistance = 50;
      categoryAxis.title.text = 'Date time ';

      let valueAxis: any = chart.yAxes.push(new am4charts.ValueAxis());
      if (chart.yAxes.indexOf(valueAxis) != 0) {
        valueAxis.syncWithAxis = chart.yAxes.getIndex(0);
      }

      valueAxis.title.text = 'Speed/Distance';
      valueAxis.title.align = "right";
      valueAxis.title.fontWeight = 600;
      // Create series
      function createAxisAndSeries(field: string, name: string, opposite: boolean, bullets: string) {


        let series = chart.series.push(new am4charts.LineSeries());

        series.dataFields.valueY = field;
        series.dataFields.categoryX = "category";
        series.strokeWidth = 2;

        //series.yAxis = valueAxis;
        series.name = name;
        series.tooltipText = "{name}: [bold]{valueY}[/]";
        series.tensionX = 0.8;
        series.showOnInit = true;

        let interfaceColors = new am4core.InterfaceColorSet();
        let bullet;
        switch (bullets) {
          case "triangle":
            bullet = series.bullets.push(new am4charts.Bullet());
            bullet.width = 12;
            bullet.height = 12;
            bullet.horizontalCenter = "middle";
            bullet.verticalCenter = "middle";

            let triangle = bullet.createChild(am4core.Triangle);
            triangle.stroke = interfaceColors.getFor("background");
            triangle.strokeWidth = 2;
            triangle.direction = "top";
            triangle.width = 12;
            triangle.height = 12;
            break;
          case "rectangle":
            bullet = series.bullets.push(new am4charts.Bullet());
            bullet.width = 10;
            bullet.height = 10;
            bullet.horizontalCenter = "middle";
            bullet.verticalCenter = "middle";

            let rectangle = bullet.createChild(am4core.Rectangle);
            rectangle.stroke = interfaceColors.getFor("background");
            rectangle.strokeWidth = 2;
            rectangle.width = 10;
            rectangle.height = 10;
            break;
          default:
            bullet = series.bullets.push(new am4charts.CircleBullet());
            bullet.circle.stroke = interfaceColors.getFor("background");
            bullet.circle.strokeWidth = 2;
            break;
        }

        valueAxis.renderer.line.strokeOpacity = 1;
        valueAxis.renderer.line.strokeWidth = 2;
        valueAxis.renderer.line.stroke = series.stroke;
        valueAxis.renderer.labels.template.fill = series.stroke;
        // valueAxis.renderer.opposite = opposite;
      }
      createAxisAndSeries("speed", "Speed ( Km/h )", false, "circle");
      createAxisAndSeries("distance", "Distance ( Km )", false, "circle");
      // Add legend
      chart.legend = new am4charts.Legend();
      // Add cursor
      chart.cursor = new am4charts.XYCursor();
      chart.scrollbarX = new am4core.Scrollbar();
      chart.scrollbarY = new am4core.Scrollbar();
    }); // end am4core.ready()
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
}
