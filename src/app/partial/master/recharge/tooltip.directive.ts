import { Directive, ElementRef, Input, HostListener, OnDestroy } from '@angular/core';
declare var $: any;


@Directive({
  selector: '[appTooltip]'
})
export class TooltipDirective {

  @Input()
  public appTooltip: any;

  constructor(private elementRef: ElementRef) { }

  @HostListener('mouseenter')
  public onMouseEnter(): void {
    const nativeElement = this.elementRef.nativeElement;
    $(nativeElement).tooltip('show');
  }

  @HostListener('mouseleave')
  public onMouseLeave(): void {
    const nativeElement = this.elementRef.nativeElement;
    $(nativeElement).tooltip('dispose');
  }


  ngOnDestroy(): void {
    const nativeElement = this.elementRef.nativeElement;
    $(nativeElement).tooltip('dispose');
  }

}
