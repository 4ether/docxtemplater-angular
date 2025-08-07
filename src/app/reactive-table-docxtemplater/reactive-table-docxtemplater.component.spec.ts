import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReactiveTableDocxtemplaterComponent } from './reactive-table-docxtemplater.component';

describe('ReactiveTableDocxtemplaterComponent', () => {
  let component: ReactiveTableDocxtemplaterComponent;
  let fixture: ComponentFixture<ReactiveTableDocxtemplaterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ReactiveTableDocxtemplaterComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ReactiveTableDocxtemplaterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
