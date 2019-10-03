import { Component, TemplateRef } from '@angular/core';
import { BsModalService, BsModalRef } from 'ngx-bootstrap';


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  constructor(private modalService: BsModalService) {}
  modalRef: BsModalRef;

  mailer = {
    firstName: '',
    lastName: '',
    phone: '',
    email: ''
  };

  isClicked = false;

  submitForm() {
    console.log(this.mailer);
    this.modalRef.hide();
  }

  openModal(template: TemplateRef<any>) {
    this.modalRef = this.modalService.show(template, {
      animated: true
    });
  }




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
