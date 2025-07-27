import { Component } from '@angular/core';
import { FooyerComponent } from "../fooyer/fooyer.component";
import { CommonModule, ViewportScroller } from '@angular/common';

@Component({
  selector: 'app-about-us',
  standalone: true,
  imports: [FooyerComponent],
  templateUrl: './about-us.component.html',
  styleUrl: './about-us.component.scss'
})
export class AboutUsComponent {

  constructor(
    private viewportScroller: ViewportScroller,


  ) { }


  ngOnInit() {
    this.viewportScroller.scrollToPosition([0, 0]);
  }

}
