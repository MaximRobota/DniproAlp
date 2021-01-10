import { Directive, ElementRef, Input, OnInit } from '@angular/core';

@Directive({ selector: '[loading]' })

export class LoadingDirective implements OnInit {
  @Input() loaded: boolean;
  constructor(private el: ElementRef) {
  }
  ngOnInit() {
    this.loadingState(this.loaded);
  }
  private loadingState(loaded) {
    this.el.nativeElement.style.display = !loaded ? 'block' : 'none';
  }
}
