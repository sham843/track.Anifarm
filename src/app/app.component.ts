import { Component, ViewChild } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { Router, NavigationEnd, ActivatedRoute, NavigationStart } from '@angular/router';
import { filter, map } from 'rxjs/operators';
import { NgxSpinnerService } from 'ngx-spinner';
import { ConnectionService } from 'ng-connection-service';
import { CommonService } from './services/common.service';
import { ToastrService } from 'ngx-toastr';


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  // title = 'VTS';
  status = 'ONLINE';
  isConnected = true;
  @ViewChild('openModal') openModal: any;
  @ViewChild('close') close: any;
  @ViewChild('tokenRefreshModalClose') tokenRefreshModalClose: any;


  constructor(private router: Router,
    private activatedRoute: ActivatedRoute,
    private spinner: NgxSpinnerService,
    private titleService: Title,
    private connectionService: ConnectionService,
    private _commonService: CommonService,
    private toastrService: ToastrService,
  ) {
    this.checkingInternetConnection();

    this.router.events.subscribe((event: any) => { //beefore page load spinner is show
      if (event instanceof NavigationStart) {
        this.spinner.show()
      }
      if (event instanceof NavigationEnd) {
        this.spinner.hide();
        window.scroll(0, 0);
      }
    });
  }

  ngOnInit() {
    this.router.events.pipe(filter(event => event instanceof NavigationEnd),
    ).subscribe(() => {
      var rt = this.getChild(this.activatedRoute)
      rt.data.subscribe((data: { title: string; }) => {
        this.titleService.setTitle(data.title)
      })
    })
  }

  getChild(activatedRoute: ActivatedRoute): any {
    if (activatedRoute.firstChild) {
      return this.getChild(activatedRoute.firstChild);
    } else {
      return activatedRoute;
    }
  }

  checkingInternetConnection() {
    this.connectionService.monitor().subscribe(isConnected => {
      this.isConnected = isConnected;
      if (this.isConnected) {
        this.status = "Internet Connection Available";
        let el: HTMLElement = this.close.nativeElement;
        el.click();
      }
      else {
        this.status = "No Internet Connection";
        let el: HTMLElement = this.openModal.nativeElement;
        el.click();
      }
    })
  }

  tokenRefreshModClose() {
    let refreshtokenModalClose: HTMLElement = this.tokenRefreshModalClose.nativeElement;
    refreshtokenModalClose.click();
  }

  logOut() {
    this.tokenRefreshModClose();
    localStorage.clear();
    this.router.navigate(['../login']);
  }

  refreshToken() {
    let obj = {
      UserId : this._commonService.loggedInUserId(),
      RefreshToken:this._commonService.tokenExpireRefreshString()
    }
    this._commonService.setHttp('post', 'vehicle-tracking/login/refresh-token', true, obj, false, 'vehicleTrackingBaseUrlApi');
    this._commonService.getHttp().subscribe((res: any) => {
      if (res.statusCode === "200") {
        let loginObj:any = localStorage.getItem('loggedInDetails');
        loginObj =   JSON.parse(loginObj);
        loginObj.responseData3 = res.responseData;
        localStorage.setItem('loggedInDetails', JSON.stringify(loginObj));

        this.toastrService.error(res.statusMessage);
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
}
