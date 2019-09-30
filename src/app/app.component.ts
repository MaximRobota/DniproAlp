import { Component } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  isClicked = true;
  toggleState() {
    this.isClicked = !this.isClicked;
  }

  scroll(el: HTMLElement) {
    el.scrollIntoView({behavior: 'smooth', block: 'end', inline: 'nearest'});
  }

  title = 'ngSlick';


  slides = [
    {img: '../assets/img/slider/slider-1/1.jpg'},
    {img: '../assets/img/slider/slider-1/2.jpg'},
    {img: '../assets/img/slider/slider-1/3.jpg'},
    {img: '../assets/img/slider/slider-1/4.jpg'},
    {img: '../assets/img/slider/slider-1/5.jpg'}
  ];

  slideConfig = {
    'slidesToShow': 4,
    'slidesToScroll': 1,
    'nextArrow':'<div class="nav-btn next-slide"></div>',
    'prevArrow':'<div class="nav-btn prev-slide"></div>',
    'dots':true,
    'infinite': false
  };

  addSlide() {
    this.slides.push({img: 'http://placehold.it/350x150/777777'});
  }

  removeSlide() {
    this.slides.length = this.slides.length - 1;
  }

  slickInit(e) {
    console.log('slick initialized');
  }

  breakpoint(e) {
    console.log('breakpoint');
  }

  afterChange(e) {
    console.log('afterChange');
  }

  beforeChange(e) {
    console.log('beforeChange');
  }


}
