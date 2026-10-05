import { TestBed } from '@angular/core/testing';
import { axeViolations } from '../testing/axe';
import { App } from './app';

describe('App accessibility', () => {
  it('has no axe violations', async () => {
    const fixture = TestBed.createComponent(App);
    await fixture.whenStable();

    expect(await axeViolations(fixture.nativeElement)).toEqual([]);
  });
});
