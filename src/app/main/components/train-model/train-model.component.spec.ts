import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TrainModelComponent } from './train-model.component';

describe('TrainModelComponent', () => {
  let component: TrainModelComponent;
  let fixture: ComponentFixture<TrainModelComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TrainModelComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(TrainModelComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
