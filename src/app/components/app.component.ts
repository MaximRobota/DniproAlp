import { Component, TemplateRef } from '@angular/core';
import { BsModalService, BsModalRef } from 'ngx-bootstrap';
import { ToasterService } from 'angular2-toaster';
import { TranslateService } from '@ngx-translate/core';
import { HttpClient } from '@angular/common/http';

export interface CallbackUsMailer {
  fioName: string;
  phone: string;
  email: string;
}

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  private toasterService: ToasterService;
  localLang;
  modalRef: BsModalRef;

  altitudeSlides = [
    {img: '../assets/img/slider/slider-1/1.jpg'},
    {img: '../assets/img/slider/slider-1/2.jpg'},
    {img: '../assets/img/slider/slider-1/3.jpg'},
    {img: '../assets/img/slider/slider-1/4.jpg'},
    {img: '../assets/img/slider/slider-1/5.jpg'}
  ];

  installationSlides = [
    {img: '../assets/img/slider/slider-2/1.jpg'},
    {img: '../assets/img/slider/slider-2/2.jpg'},
    {img: '../assets/img/slider/slider-2/3.jpg'},
    {img: '../assets/img/slider/slider-2/4.jpg'},
    {img: '../assets/img/slider/slider-2/5.jpg'},
    {img: '../assets/img/slider/slider-2/6.jpg'},
    {img: '../assets/img/slider/slider-2/7.jpg'},
    {img: '../assets/img/slider/slider-2/8.jpg'},
    {img: '../assets/img/slider/slider-2/9.jpg'}
  ];

  frontSlides = [
    {img: '../assets/img/slider/slider-3/1.jpg'},
    {img: '../assets/img/slider/slider-3/2.jpg'},
    {img: '../assets/img/slider/slider-3/3.jpg'},
    {img: '../assets/img/slider/slider-3/4.jpg'},
    {img: '../assets/img/slider/slider-3/5.jpg'},
    {img: '../assets/img/slider/slider-3/6.jpg'}
  ];

  roofingSlides = [
    {img: '../assets/img/slider/slider-4/1.jpg'}
  ];

  slideConfig = {
    slidesToShow: 6,
    slidesToScroll: 1,
    nextArrow: '<div class="nav-btn next-slide"></div>',
    prevArrow: '<div class="nav-btn prev-slide"></div>',
    dots: true,
    infinite: false
  };

  callbackUsMailer = {
    firstName: '',
    lastName: '',
    phone: '',
    email: ''
  };

  sendQuestionMailer = {
    firstName: '',
    lastName: '',
    phone: '',
    email: '',
    message: ''
  };

  url = 'http://localhost:4000';

  constructor(
    private modalService: BsModalService,
    public translate: TranslateService,
    toasterService: ToasterService,
    private http: HttpClient
  ) {
    this.toasterService = toasterService;

    // Translate
    translate.addLangs(['ru', 'ua']);
    this.localLang = localStorage.getItem('lang') ? localStorage.getItem('lang') : 'ru';
    translate.use(this.localLang);
  }

  goToNewPage() {
    window.open('https://www.facebook.com/dniproalpprom');
  }

  changeLang(lang) {
    this.translate.use(lang);
    localStorage.setItem('lang', lang);
  }

  sendler(data) {
    return this
      .http
      .post(`${this.url}/characters`, data);
  }

  callbackUs() {
    console.log(this.callbackUsMailer);
    this.sendler(this.callbackUsMailer)
      .subscribe((data) => {
        console.log(data);
        this.toasterService.pop('success', '', 'Спасибо. Заявка принята. В ближайшее время с Вами свяжется наш менеджер.');
        this.modalRef.hide();
      });
  }

  sendMessage() {
    console.log(this.sendQuestionMailer);
    this.toasterService.pop('success', '', 'Спасибо. Вопрос отправлен нашему менеджеру.');
    this.modalRef.hide();
  }

  openModal(template: TemplateRef<any>) {
    this.modalRef = this.modalService.show(template, {
      animated: true
    });
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
