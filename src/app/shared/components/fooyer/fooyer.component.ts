import { Component } from '@angular/core';
import { DishesService } from '../../services/dishes/dishes.service';
import { RouterLink } from '@angular/router';
import { SsrLinkDirective } from '../../directives/ssr-link.directive';

@Component({
  selector: 'app-fooyer',
  standalone: true,
  imports: [SsrLinkDirective],
  templateUrl: './fooyer.component.html',
  styleUrl: './fooyer.component.scss'
})
export class FooyerComponent {
  dishesList: any[] = [];

  constructor(
    private cdishesService: DishesService,
  ) { }


  ngOnInit(): void {
    this.cdishesService.getAllLight().subscribe((data: any) => {
      this.dishesList = data;
    });
  }
}
