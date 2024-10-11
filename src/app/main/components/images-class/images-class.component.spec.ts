import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ImagesClassComponent } from './images-class.component';

describe('ImagesClassComponent', () => {
  let component: ImagesClassComponent;
  let fixture: ComponentFixture<ImagesClassComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ImagesClassComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ImagesClassComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
