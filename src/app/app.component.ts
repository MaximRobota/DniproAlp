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
    el.scrollIntoView({behavior: "smooth", block: "end", inline: "nearest"});
  }
}
