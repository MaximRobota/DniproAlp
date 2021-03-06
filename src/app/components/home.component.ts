import { BsModalService, BsModalRef } from 'ngx-bootstrap';
import { Component, TemplateRef, OnInit } from '@angular/core';
import { environment } from "../../environments/environment";
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { ToasterService } from 'angular2-toaster';
import { TranslateService } from '@ngx-translate/core';

declare let fbq: any;

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css', './app.media.css']
})
export class HomeComponent implements OnInit {
  public toasterService: ToasterService;

  constructor(
    private formBuilder: FormBuilder,
    private http: HttpClient,
    private modalService: BsModalService,
    public translate: TranslateService,
    toasterService: ToasterService,
  ) {
    this.loaded = false;
    this.fakeLoading(1000);

    this.toasterService = toasterService;

    // Translate
    const localLang = localStorage.getItem('lang') ? localStorage.getItem('lang') : 'ru';
    translate.addLangs(['ru', 'ua']);
    translate.use(localLang);
  }

  loaded: boolean;
  modalRef: BsModalRef;
  phoneShow = false;
  registerForm: FormGroup; // Todo
  submitted = false;

  priceItems = [{ // todo: remove to BE
    group: {
      title: 'Фасадные работы',
      list: [{
        name: 'Утепление фасада альпинистами',
        units: 'м.кв.',
        price: 'от 600 грн.',
        description: 'с материалом'
      }, {
        name: 'Ремонт и покраска фасада',
        units: 'м.кв.',
        price: 'от 25 грн.',
        description: 'без материала'
      }, {
        name: 'Гидрофобизация фасада',
        units: 'м.кв.',
        price: 'от 20 грн.',
        description: 'без материала'
      }, {
        name: 'Простукивание плитки',
        units: 'м.пог.',
        price: 'от 10 грн.',
        description: ''
      }, {
        name: 'Обследование фасада альпинистами',
        units: 'вызов',
        price: 'от 2000 грн.',
        description: ''
      }, {
        name: 'Герметизация швов',
        units: 'м.пог.',
        price: 'от 120 грн.',
        description: 'с материалом'
      }, {
        name: 'Герметизация швов с выбивание',
        units: 'м.пог.',
        price: 'от 300 грн.',
        description: 'с материалом'
      }]
    }
  }, {
    group: {
      title: 'Клининговые работы',
      list: [{
        name: 'Мойка окон альпинистами',
        units: 'м.кв.',
        price: 'от 20 грн.',
        description: 'от 150 м.кв.'
      }, {
        name: 'Мойка малых объемах',
        units: 'вызов',
        price: 'от 2000 грн.',
        description: ''
      }, {
        name: 'Мойка фасада',
        units: 'м.кв.',
        price: 'от 15 грн.',
        description: 'от 200 м.кв.'
      }, {
        name: 'Чистка крыш от снега и сосулек',
        units: 'вызов',
        price: 'от 2000 грн.',
        description: ''
      }, {
        name: 'Чистка крыш от снега и сосулек',
        units: 'м.кв.',
        price: 'от 15 грн.',
        description: 'от 200 м.кв.'
      }, {
        name: 'Очистка фасада от высолов',
        units: 'м.кв.',
        price: 'от 35 грн.',
        description: ''
      }]
    }
  }, {
    group: {
      title: 'Монтажные работы на высоте',
      list: [{
        name: 'Монтаж воздуховодов вентиляции',
        units: 'м.пог.',
        price: 'от 120 грн.',
        description: ''
      }, {
        name: 'Монтаж сэндвич дымоходов',
        units: 'м.пог.',
        price: 'от 150 грн.',
        description: ''
      }, {
        name: 'Монтаж водосточных труб',
        units: 'м.пог.',
        price: 'от 100 грн.',
        description: ''
      }, {
        name: 'Монтаж рекламных баннеров',
        units: 'м.кв.',
        price: 'от 50 грн.',
        description: ''
      }, {
        name: 'Монтаж рекламных каркаса для баннеров',
        units: 'м.пог.',
        price: 'от 100 грн.',
        description: ''
      }, {
        name: 'Монтаж баннерной сетки',
        units: 'м.кв.',
        price: 'от 35 грн.',
        description: ''
      }, {
        name: 'Монтаж декора, объёмных букв, логотипа',
        units: '',
        price: 'догов.',
        description: ''
      }, {
        name: 'Монтаж отлива на окна',
        units: 'м.пог.',
        price: 'от 75 грн.',
        description: ''
      }]
    }
  }, {
    group: {
      title: 'Подъем/спуск груза альпинистами',
      list: [{
        name: 'Подъем груза до 50 кг',
        units: 'шт.',
        price: 'от 2500 грн.',
        description: ''
      }, {
        name: 'Подъем груза до 100 кг',
        units: 'шт.',
        price: 'от 3000 грн.',
        description: ''
      }, {
        name: 'Подъем груза до 200 кг',
        units: 'шт.',
        price: 'от 9000 грн.',
        description: ''
      }, {
        name: 'Подъем груза свыше 300 кг',
        units: 'шт.',
        price: 'от 12000 грн.',
        description: ''
      }]
    }
  }];

  altitudeSlides = [ // todo: remove to BE
    {
      img: '../assets/img/slider/slider-1/1.jpg',
      description: 'slider-1.slide-1'
    },
    {img: '../assets/img/slider/slider-1/2.jpg',
      description: 'slider-1.slide-2'
    },
    {img: '../assets/img/slider/slider-1/3.jpg',
      description: 'slider-1.slide-3'
    },
    {img: '../assets/img/slider/slider-1/4.jpg',
      description: 'slider-1.slide-4'
    },
    {img: '../assets/img/slider/slider-1/5.jpg',
      description: 'slider-1.slide-5'
    }
  ];

  installationSlides = [ // todo: remove to BE
    {img: '../assets/img/slider/slider-2/1.jpg',
      description: 'slider-2.slide-1'
    },
    {img: '../assets/img/slider/slider-2/2.jpg',
      description: 'slider-2.slide-2'
    },
    {img: '../assets/img/slider/slider-2/3.jpg',
      description: 'slider-2.slide-3'
    },
    {img: '../assets/img/slider/slider-2/4.jpg',
      description: 'slider-2.slide-4'
    },
    {img: '../assets/img/slider/slider-2/5.jpg',
      description: 'slider-2.slide-5'
    },
    {img: '../assets/img/slider/slider-2/6.jpg',
      description: 'slider-2.slide-6'
    },
    {img: '../assets/img/slider/slider-2/7.jpg',
      description: 'slider-2.slide-7'
    },
    {img: '../assets/img/slider/slider-2/8.jpg',
      description: 'slider-2.slide-8'
    },
    {img: '../assets/img/slider/slider-2/9.jpg',
      description: 'slider-2.slide-9'
    }
  ];

  frontSlides = [ // todo: remove to BE
    {img: '../assets/img/slider/slider-3/1.jpg',
      description: 'slider-3.slide-1'
    },
    {img: '../assets/img/slider/slider-3/2.jpg',
      description: 'slider-3.slide-2'
    },
    {img: '../assets/img/slider/slider-3/3.jpg',
      description: 'slider-3.slide-3'
    },
    {img: '../assets/img/slider/slider-3/4.jpg',
      description: 'slider-3.slide-4'
    },
    {img: '../assets/img/slider/slider-3/5.jpg',
      description: 'slider-3.slide-5'
    },
    {img: '../assets/img/slider/slider-3/6.jpg',
      description: 'slider-3.slide-6'
    }
  ];

  roofingSlides = [
    {img: '../assets/img/slider/slider-4/1.jpg',
      description: 'slider-4.slide-1'
    }
  ];

  typeWorkListItems = [{ // todo: remove to BE
      value: 0,
      name: 'Монтаж/демонтаж'
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
    slidesToShow: (window.innerWidth > 960) ? 5 : 1,
    slidesToScroll: 1,
    nextArrow: '<div class="nav-btn next-slide"></div>',
    prevArrow: '<div class="nav-btn prev-slide"></div>',
    dots: true,
    infinite: false,
    adaptiveHeight: true
  };

  thumbnailsSlider = {
    slidesToShow: 1,
    slidesToScroll: 1,
    nextArrow: '<div class="nav-btn next-slide"></div>',
    prevArrow: '<div class="nav-btn prev-slide"></div>',
    cssEase: 'linear',
    fade: true,
    dots: true,
    infinite: false,
    draggable: true
  };

  firstStep = true;

  ngOnInit() {
    this.init();
    this.registerForm = this.formBuilder.group({
      full_name: ['', Validators.required],
      phone: ['', Validators.compose([
        Validators.maxLength(25),
        Validators.minLength(9),
        Validators.required])
      ],
      email: [''],
      message: ['', Validators.compose([
          Validators.minLength(9)])],
      claim_type: ['', [Validators.required]]
    });
  }
  get f() { return this.registerForm.controls; }

  changeLang(lang) {
    this.loaded = false;
    this.translate.use(lang);
    localStorage.setItem('lang', lang);
    this.fakeLoading(300);
  }

  submit(data) {
    this.loaded = false;
    return this.http.post(`${environment.apiUrl}/claims`, data);
  }

  callbackUs() {
    this.submitted = true;
    if (this.registerForm.invalid) {
      return;
    }
    this.submit(this.registerForm.value)
      .subscribe(() => {
          this.fakeLoading(300);
          fbq('track', 'Lead');
          this.firstStep = false;
        },
        error => {
          this.fakeLoading(300);
          this.toasterService.pop('error', '', error.message);
        });
  }

  openModal(template: TemplateRef<any>) {
    this.firstStep = true;
    this.modalRef = this.modalService.show(template, {
      animated: true,
      keyboard: true,
      backdrop: true,
      ignoreBackdropClick: false,
      class: 'modal-sm'
    });
  }

  openPriceModal(template: TemplateRef<any>) {
    this.modalRef = this.modalService.show(template, {
      animated: true,
      keyboard: true,
      backdrop: true,
      ignoreBackdropClick: false,
      class: 'modal-lg'
    });
  }

  slickInit(e) {
    // console.log('slick initialized');
  }

  breakpoint(e) {
    console.log('breakpoint');
  }

  afterChange(e) {
    // console.log('afterChange');
  }

  beforeChange(e) {
    // console.log('beforeChange');
  }

  fakeLoading(timeout) {
    setTimeout(() => {
      this.loaded = true;
    }, timeout);
  }

  isPhoneShow() {
    setTimeout(() => {
      this.phoneShow = false;
    }, 20000);
    return this.phoneShow = !this.phoneShow;
  }

  priceTableHeader() { // todo: remove to BE
    return this.translate.currentLang === 'ru' ? ['Наименование работы', 'Ед.изм.', 'Цены от', 'Примечания'] :
      ['Найменування робіт', 'Од.вим.', 'Ціни від', 'Примітки'];
  }
//
  init() {
    const elements = [].slice.call(document.querySelectorAll('a:not([target="_blank"])'));
    for (const anchor of  elements) {
      anchor.addEventListener('click', (e) => {
        e.preventDefault();
        const linkHash = getHash(e.currentTarget.href);
        if (!goToSection(linkHash) && e.currentTarget.href) {
          goToUrl(e.currentTarget.href);
        }
      });
    }
    window.addEventListener('scroll', () => {
      setActiveAnchor();
    });

    function getHash(href) {
      return href.split('#')[1];
    }

    function goToSection(linkHash) {
      const section = getSection(linkHash);
      if (section) {
        const offsetTop = section['offsetTop'];
        scrollTo(offsetTop, 100);
        history.pushState({}, null, '#' + linkHash);
        return true;
      } else {
        return false;
      }
    }

    function scrollTo(destOffset, duration) {
      const diffOffset = destOffset - ( document.scrollingElement || document.documentElement).scrollTop,
        partDist = diffOffset / duration * 1;

      if (duration <= 0) {
        return;
      }
      setTimeout(() => {
        (document.scrollingElement || document.documentElement).scrollTop =
          (document.scrollingElement || document.documentElement).scrollTop + partDist;
        if ((document.scrollingElement || document.documentElement).scrollTop === destOffset) {
          return;
        }
        scrollTo(destOffset, duration - 1);
      }, 1);
    }

    function goToUrl(url) {
      return window.location = url;
    }

    function setActiveAnchor() {
      const elements = [].slice.call(document.querySelectorAll('a:not([target="_blank"])'));
      for (let anchor of elements) {
        const linkHash = getHash(anchor.href),
          section = getSection(linkHash),
          offset = (document.scrollingElement || document.documentElement).scrollTop,
          scrollHeight = (document.scrollingElement || document.documentElement).scrollHeight;
        if (section && (((section['offsetTop'] <= offset) && (section['offsetTop'] + section['offsetHeight'] > offset))
          || ((offset + window.innerHeight) === scrollHeight))) {
          for (let link of elements) {
            if (link.href !== anchor.href) {
              link.classList.remove('active');
            }
          }
          anchor.classList.add('active');
        }
      }
    }

    function getSection(linkHash) {
      if (linkHash) {
        const id = '#' + linkHash;
        return document.querySelector(id);
      }
      return false;
    }
  }
  //
}
