import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CarouselAnimeComponent } from './carousel-anime.component';

describe('CarouselAnimeComponent', () => {
  let component: CarouselAnimeComponent;
  let fixture: ComponentFixture<CarouselAnimeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CarouselAnimeComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CarouselAnimeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
