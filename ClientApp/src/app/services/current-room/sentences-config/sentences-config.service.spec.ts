import { TestBed } from '@angular/core/testing';

import { SentencesConfigService } from './sentences-config.service';

describe('GameConfigService', () => {
  let service: SentencesConfigService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SentencesConfigService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
