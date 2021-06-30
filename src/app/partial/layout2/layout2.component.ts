import { Component, OnInit } from '@angular/core';
declare var $: any

@Component({
  selector: 'app-layout2',
  templateUrl: './layout2.component.html',
  styleUrls: ['./layout2.component.css']
})
export class Layout2Component implements OnInit {

  constructor() { }

  ngOnInit(): void {
    $(".dropdown-menu a.dropdown-toggle").on("click", function(this:any) {
      var s = $(this);
      s.toggleClass("active-dropdown");
      var n = $(this).offsetParent(".dropdown-menu");
      $(this).next().hasClass("show") || $(this).parents(".dropdown-menu").first().find(".show").removeClass("show");
      var e = $(this).next(".dropdown-menu");
      return e.toggleClass("show"), $(this).parent("li").toggleClass("show"), $(this).parents("li.nav-item.dropdown.show").on("hidden.bs.dropdown", function() {
          $(".dropdown-menu .show").removeClass("show"), s.removeClass("active-dropdown")
      }), n.parent().hasClass("navbar-nav") || s.next().css({
          top: s[0].offsetTop,
          left: n.outerWidth() - 4
      }), !1
  })
  }
}
