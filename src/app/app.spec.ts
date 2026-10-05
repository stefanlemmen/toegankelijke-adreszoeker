import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
  TestRequest,
} from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { advance, definitionOf, elementWithText, inputLabelled, typeInto } from '@testing/dom';
import { LOOKUP_DAMRAK_18_1, LOOKUP_NOT_FOUND, SUGGEST_DAMRAK } from '@testing/pdok-fixtures';
import { isLookupRequestFor, isSuggestRequestFor } from '@testing/pdok-requests';
import { App } from './app';

// From the agreed plan, not from the implementation.
const DEBOUNCE_MS = 300;

async function searchFor(page: HTMLElement, query: string): Promise<TestRequest> {
  typeInto(inputLabelled(page, 'Adres'), query);
  await advance(DEBOUNCE_MS);
  return TestBed.inject(HttpTestingController).expectOne(isSuggestRequestFor(query));
}

describe('App', () => {
  let page: HTMLElement;
  let http: HttpTestingController;

  beforeEach(async () => {
    vi.useFakeTimers();
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    http = TestBed.inject(HttpTestingController);
    page = TestBed.createComponent(App).nativeElement;
    await advance();
  });

  afterEach(() => {
    http.verify();
    vi.useRealTimers();
  });

  it('shows suggestions for the typed address after the debounce', async () => {
    typeInto(inputLabelled(page, 'Adres'), 'damrak');

    await advance(DEBOUNCE_MS - 1);
    http.expectNone(isSuggestRequestFor('damrak'));

    await advance(1);
    http.expectOne(isSuggestRequestFor('damrak')).flush(SUGGEST_DAMRAK);
    await advance();

    expect(page.textContent).toContain('Damrak 18-1, Amsterdam');
    expect(page.textContent).toContain('Damrak 201, Amsterdam');
    expect(page.textContent).toContain('Damrak 1, 1012LG Amsterdam');
  });

  it('only searches from 2 characters', async () => {
    typeInto(inputLabelled(page, 'Adres'), 'd');
    await advance(DEBOUNCE_MS);
    http.expectNone(() => true);

    await searchFor(page, 'da');
  });

  it('shows the details of the chosen address', async () => {
    (await searchFor(page, 'damrak')).flush(SUGGEST_DAMRAK);
    await advance();

    elementWithText(page, 'Damrak 18-1, Amsterdam').click();
    await advance();
    http.expectOne(isLookupRequestFor('adr-damrak-18-1')).flush(LOOKUP_DAMRAK_18_1);
    await advance();

    expect(definitionOf(page, 'Straat')).toBe('Damrak');
    expect(definitionOf(page, 'Huisnummer')).toBe('18-1');
    expect(definitionOf(page, 'Postcode')).toBe('Onbekend');
    expect(definitionOf(page, 'Woonplaats')).toBe('Amsterdam');
    expect(definitionOf(page, 'Gemeente')).toBe('Amsterdam');
  });

  it('shows an error message when searching fails', async () => {
    (await searchFor(page, 'damrak')).flush(null, {
      status: 500,
      statusText: 'Internal Server Error',
    });
    await advance();

    expect(page.textContent).toContain('Er ging iets mis bij het zoeken. Probeer het opnieuw.');
  });

  it('shows an error message when the address details are not found', async () => {
    (await searchFor(page, 'damrak')).flush(SUGGEST_DAMRAK);
    await advance();

    elementWithText(page, 'Damrak 18-1, Amsterdam').click();
    await advance();
    http.expectOne(isLookupRequestFor('adr-damrak-18-1')).flush(LOOKUP_NOT_FOUND);
    await advance();

    expect(page.textContent).toContain(
      'De details van dit adres konden niet worden opgehaald. Probeer het opnieuw.',
    );
  });
});
