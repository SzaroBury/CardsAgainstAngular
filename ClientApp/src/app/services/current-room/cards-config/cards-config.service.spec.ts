import { TestBed } from '@angular/core/testing';

import { CardsConfigService } from './cards-config.service';

describe('CardsConfigService', () => {
  let service: CardsConfigService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CardsConfigService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
