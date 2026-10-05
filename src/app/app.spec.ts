import { TestBed } from '@angular/core/testing';
import { App } from './app';

describe('App', () => {
  it('renders a single h1', async () => {
    const fixture = TestBed.createComponent(App);
    await fixture.whenStable();
    const headings = (fixture.nativeElement as HTMLElement).querySelectorAll('h1');

    expect(headings).toHaveLength(1);
    expect(headings[0].textContent).toBe('Adreszoeker');
  });
});
