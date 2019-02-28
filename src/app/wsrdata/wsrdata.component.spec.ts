import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { WSRDATAComponent } from './wsrdata.component';

describe('WSRDATAComponent', () => {
  let component: WSRDATAComponent;
  let fixture: ComponentFixture<WSRDATAComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ WSRDATAComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(WSRDATAComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
