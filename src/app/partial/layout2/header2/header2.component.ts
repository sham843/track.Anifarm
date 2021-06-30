import { Component, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { CommonService } from 'src/app/services/common.service';


@Component({
  selector: 'app-header2',
  templateUrl: './header2.component.html',
  styleUrls: ['./header2.component.css']
})
export class Header2Component implements OnInit {
  showMenu: boolean = false;
  getMobileNo: any;
  getUserName: any;


  constructor(private router: Router,
    private _commonService: CommonService
  ) { }

  ngOnInit(): void {
    this.getMobileNo = this._commonService.loggedInUserMobile();
    this.getUserName = this._commonService.loggedInUsername();
  }


  logout() {
    localStorage.clear();
    this.router.navigate(['../login']);
  }

  toggleMenu(): void {
    this.showMenu = !this.showMenu;
  }
}
