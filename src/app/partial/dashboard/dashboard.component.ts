import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { CommonService } from 'src/app/services/common.service';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import * as am4core from "@amcharts/amcharts4/core";
import * as am4charts from "@amcharts/amcharts4/charts";
import am4themes_animated from "@amcharts/amcharts4/themes/animated";
import { Router } from '@angular/router';
@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {
  p: number = 1;
  userRole: any;
  resBreakdownReport: any;
  resInvoiceDetails: any;
  resSimDueAndOverDue: any;
  resComplaintDetails: any;
  resVehicleStatusCount: any;
  resVehiclesCountDashboard: any;
  stopVehicles: any="";
  runningVehicles: any="";
  totoalCountVehicles: any;
  offlineVehicles: any="";
  piChartMsg:boolean = false;
  totalVehicles: any;
  loggedInUserId = this._commonService.loggedInUserId();
  loading = false;

  
  constructor(private _commonService: CommonService,
    private spinner: NgxSpinnerService,
    private toastrService: ToastrService,
    private router:Router,
  ) { }

  ngOnInit(): void {
    this.userRole = this._commonService.userRole();
    this.getBreakdownReport();
    this.getInvoiceDetails();
    this.getSimDueAndOverDue();
    this.getComplaintDetails();
    this.getVehicleStatusCount();
    this.getVehiclesCountDashboard();
  }



  getBreakdownReport() {
    this.spinner.show();
    this._commonService.setHttp('get', 'vehicle-tracking/dashboard/get-breakdown-report?UserId=' + this.loggedInUserId, true, false, false, 'vehicleTrackingBaseUrlApi');
    this._commonService.getHttp().subscribe((res: any) => {
      if (res.statusCode === "200") {
        this.resBreakdownReport = res;
        this.resBreakdownReport = this.resBreakdownReport?.responseData
        this.spinner.hide();
      }
      else if (res.statusCode === "409") {
        this.spinner.hide();
        this.toastrService.error(res.statusMessage);
      }
      else {
        this.spinner.hide();
        // this.toastrService.error(res.statusMessage);
      }
    })
  }

  getInvoiceDetails() {
    this.spinner.show();
    this._commonService.setHttp('get', 'vehicle-tracking/dashboard/get-invoice-details?UserId=' + this.loggedInUserId, true, false, false, 'vehicleTrackingBaseUrlApi');
    this._commonService.getHttp().subscribe((res: any) => {
      this.resInvoiceDetails = res;
      this.resInvoiceDetails = this.resInvoiceDetails?.responseData;
      if (res.statusCode === "200") {
        this.spinner.hide();
      }
      else if (res.statusCode === "409") {
        this.spinner.hide();
        this.toastrService.error(res.statusMessage);
      }
      else {
        this.spinner.hide();
        // this.toastrService.error(res.statusMessage);
      }
    })
  }

  getSimDueAndOverDue() {
    this.spinner.show();
    this._commonService.setHttp('get', 'vehicle-tracking/dashboard/get-sim-due-and-over-due?UserId=' + this.loggedInUserId, true, false, false, 'vehicleTrackingBaseUrlApi');
    this._commonService.getHttp().subscribe((res: any) => {
      if (res.statusCode === "200") {
        this.resSimDueAndOverDue = res;
        this.spinner.hide();
      }
      else if (res.statusCode === "409") {
        this.spinner.hide();
        this.toastrService.error(res.statusMessage);
      }
      else {
        this.spinner.hide();
        // this.toastrService.error(res.statusMessage);
      }
    })
  }

  getComplaintDetails() {
    this.spinner.show();
    this._commonService.setHttp('get', 'vehicle-tracking/dashboard/get-complaint-details?UserId=' + this.loggedInUserId, true, false, false, 'vehicleTrackingBaseUrlApi');
    this._commonService.getHttp().subscribe((res: any) => {
      if (res.statusCode === "200") {
        this.resComplaintDetails = res;
        this.spinner.hide();
      }
      else if (res.statusCode === "409") {
        this.spinner.hide();
        this.toastrService.error(res.statusMessage);
      }
      else {
        this.spinner.hide();
        //  this.toastrService.error(res.statusMessage);
      }

    })
  }

  getVehicleStatusCount() {
    this.loading = true;
    this.spinner.show();
    this._commonService.setHttp('get', 'vehicle-tracking/tracking/get-vehicle-status-count?UserId=' + this.loggedInUserId, true, false, false, 'vehicleTrackingBaseUrlApi');
    this._commonService.getHttp().subscribe((res: any) => {
      if (res.statusCode === "200") {
        this.stopVehicles = res.responseData.stopVehicles;
        this.offlineVehicles = res.responseData.offlineVehicles;
        this.runningVehicles = res.responseData.runningVehicles;
        this.totalVehicles = res.responseData.totalVehicles;
        if((this.stopVehicles == 0) && (this.offlineVehicles  == 0) && (this.runningVehicles  == 0)){
          this.piChartMsg = true;
          this.loading = false;
        }
        else{
          this.pieChart(this.stopVehicles, this.offlineVehicles, this.runningVehicles, this.totalVehicles);
          this.loading = false;
        }
       
        //this.totoalCountVehicles = res.stopVehicles + res.responseData.offlineVehicles + res.responseData.runningVehicles;
        this.spinner.hide();
      }
      else if (res.statusCode === "409") {
        this.spinner.hide();
        this.toastrService.error(res.statusMessage);
      }
      else {
        this.spinner.hide();
        this.toastrService.error(res.statusMessage);
      }

    })
  }


  pieChart(stopVehicles:any, offlineVehicles:any, runningVehicles:any, totalVehicles:any) {
 
    am4core.useTheme(am4themes_animated,);
    // Themes end

    // Create chart instance
    let chart = am4core.create("chartdiv", am4charts.PieChart);
    am4core.addLicense("ch-custom-attribution");


    var label = chart.seriesContainer.createChild(am4core.Label);
    label.text = totalVehicles;
    label.horizontalCenter = "middle";
    label.verticalCenter = "middle";
    label.fontSize = 16;

    // Add and configure Series
    
    let pieSeries = chart.series.push(new am4charts.PieSeries());

    pieSeries.dataFields.value = "count";
    pieSeries.dataFields.category = "vehicle";
    pieSeries.dataFields.hidden = "hidden";

    // Let's cut a hole in our Pie chart the size of 30% the radius
    chart.innerRadius = am4core.percent(35);

    // Put a thick white border around each Slice
    pieSeries.slices.template.stroke = am4core.color("#fff");
    pieSeries.colors.list = [  am4core.color("#43a047"), am4core.color("#fb8c00"),am4core.color("#e53935"), am4core.color("#00acc1")];
    pieSeries.slices.template.strokeWidth = 2;
    pieSeries.slices.template.strokeOpacity = 1;
    pieSeries.slices.template
      // change the cursor on hover to make it apparent the object can be interacted with
      .cursorOverStyle = [
        {
          "property": "cursor",
          "value": "pointer"
        }
      ];

    pieSeries.alignLabels = false;
    pieSeries.labels.template.bent = true;
    pieSeries.labels.template.radius = 3;
    pieSeries.labels.template.padding(0, 0, 0, 0);

    pieSeries.ticks.template.disabled = true;

    // Create a base filter effect (as if it's not there) for the hover to return to
    let shadow = pieSeries.slices.template.filters.push(new am4core.DropShadowFilter);
    shadow.opacity = 0;

    // Create hover state
    let hoverState: any = pieSeries.slices.template.states.getKey("hover"); // normally we have to create the hover state, in this case it already exists

    // Slightly shift the shadow and make it more prominent on hover
    let hoverShadow = hoverState.filters.push(new am4core.DropShadowFilter);
    hoverShadow.opacity = 0.7;
    hoverShadow.blur = 5;

    // stopVehicles:any, offlineVehicles:any, runningVehicles:any
    // Add a legend
    // chart.legend = new am4charts.Legend();
    // chart.legend.position = "right"; 
    chart.data = [
      {
        "vehicle": "Running",
        "count": runningVehicles,
        "hidden": (runningVehicles === 0 ? true : false),
        "id": "1"
    }, {
        "vehicle": "Offline",
        "count": offlineVehicles,
        "hidden": (offlineVehicles === 0 ? true : false),
        "id": "5"
    }, {
        "vehicle": "Stopped",
        "count": stopVehicles,
        "hidden": (stopVehicles === 0 ? true : false),
        "id": "2"
    }
    ]
  }

  getVehiclesCountDashboard() {
    this.spinner.show();
    this._commonService.setHttp('get', 'vehicle-tracking/dashboard/get-vehicles-count-dashboard?UserId=' + this.loggedInUserId, true, false, false, 'vehicleTrackingBaseUrlApi');
    this._commonService.getHttp().subscribe((res: any) => {
      if (res.statusCode === "200") {
        this.resVehiclesCountDashboard = res;
        this.spinner.hide();
      }
      else if (res.statusCode === "409") {
        this.spinner.hide();
        this.toastrService.error(res.statusMessage);
      }
      else {
        this.spinner.hide();
        this.toastrService.error(res.statusMessage);
      }
    })
  }

  redirectMap(status:any){
      this.router.navigate(['map'],{ state: { example: status}});
  }
}
