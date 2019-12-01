import { Component, TemplateRef, OnInit } from '@angular/core';
import { BsModalService, BsModalRef } from 'ngx-bootstrap';
import { ToasterService } from 'angular2-toaster';
import { TranslateService } from '@ngx-translate/core';
import { HttpClient } from '@angular/common/http';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

export interface CallbackUsMailer {
  fullName: string;
  phone: string;
  email: string;
}

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css', './app.media.css']
})
export class AppComponent implements OnInit {
  private toasterService: ToasterService;
  registerForm: FormGroup;
  submitted = false;
  phoneShow = false;
  localLang;
  modalRef: BsModalRef;
  loaded: boolean;

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

  typeWorkListItems = [{
    value: 0,
    name: ' Монтаж/демонтаж'
  }, {
    value: 1,
    name: 'Фасадные работы'
  }, {
    value: 2,
    name: 'Работы в промышленной зоне'
  }, {
    value: 3,
    name: 'Подъем и спуск негабаритных грузов'
  }, {
    value: 4,
    name: 'Клининговые услуги'
  }
  ];

  roofingSlides = [
    {img: '../assets/img/slider/slider-4/1.jpg'}
  ];

  questionSlides = [
    {
      header: 'page-6.text-3',
      text: 'page-6.text-4'
    }, {
      header: 'page-6.text-5',
      text: 'page-6.text-6'
    }, {
      header: 'page-6.text-7',
      text: 'page-6.text-8'
    }
  ];

  slideConfig = {
    slidesToShow: 3,
    slidesToScroll: 1,
    nextArrow: '<div class="nav-btn next-slide"></div>',
    prevArrow: '<div class="nav-btn prev-slide"></div>',
    dots: true,
    infinite: false
  };

  thumbnailsSlider = {
    slidesToShow: 1,
    slidesToScroll: 1,
    nextArrow: '<div class="nav-btn next-slide"></div>',
    prevArrow: '<div class="nav-btn prev-slide"></div>',
    cssEase: 'linear',
    fade: true,
    infinite: false,
    draggable: true
  };

  callbackUsMailer = {
    fullName: '',
    phone: '',
    email: ''
  };

  sendQuestionMailer = {
    fullName: '',
    phone: '',
    email: '',
    message: ''
  };

  url = 'http://dniproalpprom.com:3000';
  // url = 'http://localhost:3000';

  constructor(
    private modalService: BsModalService,
    public translate: TranslateService,
    toasterService: ToasterService,
    private http: HttpClient,
    private formBuilder: FormBuilder
  ) {
    this.loaded = false;
    this.fakeLoading(1000);

    this.toasterService = toasterService;

    // Translate
    translate.addLangs(['ru', 'ua']);
    this.localLang = localStorage.getItem('lang') ? localStorage.getItem('lang') : 'ru';
    translate.use(this.localLang);
  }

  ngOnInit() {
    this.registerForm = this.formBuilder.group({
      fullName: ['', Validators.required],
      phone: ['', Validators.compose([
          Validators.maxLength(25),
          Validators.minLength(9),
          // Validators.pattern('^(?=.*[a-zA-Z])(?=.*[0-9])[a-zA-Z0-9]+$'),
          Validators.required])
      ],
      email: ['', [Validators.required, Validators.email]],
    });
  }
  get f() { return this.registerForm.controls; }

  goToNewPage() {
    window.open('https://www.facebook.com/dniproalpprom');
  }

  changeLang(lang) {
    this.loaded = false;
    this.translate.use(lang);
    localStorage.setItem('lang', lang);
    this.fakeLoading(300);
  }

  sendler(data) {
    this.loaded = false;
    return this
      .http
      .post(`${this.url}/contact-us`, data);
  }

  callbackUs() {
    this.submitted = true;
    console.log(this.registerForm);

    if (this.registerForm.invalid) {
      return;
    }
    console.log(this.callbackUsMailer);
    this.sendler(this.callbackUsMailer)
      .subscribe((data) => {
        console.log(data);
        this.toasterService.pop('success', '', 'Спасибо. Заявка принята. В ближайшее время с Вами свяжется наш менеджер.');
        this.fakeLoading(300);
        this.modalRef.hide();
      },
        error => {
          this.fakeLoading(300);
          this.toasterService.pop('error', '', error.message);
        });
  }

  sendMessage() {
    console.log(this.sendQuestionMailer);
    this.sendler(this.sendQuestionMailer)
      .subscribe((data) => {
          console.log(data);
          this.toasterService.pop('success', '', 'Спасибо. Вопрос отправлен нашему менеджеру.');
          this.modalRef.hide();
        },
        error => {
          this.fakeLoading(300);
          this.toasterService.pop('error', '', error.message);
        });
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

  fakeLoading(timeout) {
    setTimeout(() => {
      this.loaded = true;
    }, timeout);
  }
}
