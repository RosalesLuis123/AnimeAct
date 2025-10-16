import { Component } from '@angular/core';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent {
  sections = [
    { title: 'En Emisión', type: 'airing' },
    { title: 'Populares', type: 'popular' },
    { title: 'Accion', type: 'action' },
    { title: 'Próximos Estrenos', type: 'upcoming' }
  ];
}
