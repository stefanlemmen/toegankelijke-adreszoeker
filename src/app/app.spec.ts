import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
  TestRequest,
} from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { axeViolations } from '@testing/axe';
import {
  activeOptionOf,
  advance,
  definitionOf,
  descriptionOf,
  elementWithText,
  inputLabelled,
  optionsOf,
  pressKey,
  statusMessages,
  typeInto,
} from '@testing/dom';
import {
  LOOKUP_DAMRAK_18_1,
  LOOKUP_NOT_FOUND,
  SUGGEST_DAMRAK,
  SUGGEST_DAMRAK_201,
  SUGGEST_NONE,
} from '@testing/pdok-fixtures';
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
    onTestFinished(() => http.verify());
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('presents the search field as a combobox that controls a list of options', async () => {
    const combobox = inputLabelled(page, 'Adres');
    expect(combobox.getAttribute('role')).toBe('combobox');
    expect(combobox.getAttribute('aria-autocomplete')).toBe('list');
    expect(combobox.getAttribute('aria-expanded')).toBe('false');

    (await searchFor(page, 'damrak')).flush(SUGGEST_DAMRAK);
    await advance();

    expect(combobox.getAttribute('aria-expanded')).toBe('true');
    expect(optionsOf(page, combobox)).toEqual([
      'Damrak 18-1, Amsterdam',
      'Damrak 201, Amsterdam',
      'Damrak 1, 1012LG Amsterdam',
    ]);
  });

  it('describes the search field with an example address', () => {
    const combobox = inputLabelled(page, 'Adres');
    expect(descriptionOf(page, combobox)).toBe('Bijvoorbeeld: Damrak 1 Amsterdam');
  });

  it('links to the source code in the page footer, in the same tab', () => {
    const link = elementWithText(page, 'Broncode op GitHub');
    if (!(link instanceof HTMLAnchorElement)) {
      throw new Error('"Broncode op GitHub" is not a link');
    }
    expect(link.getAttribute('href')).toBe(
      'https://github.com/stefanlemmen/toegankelijke-adreszoeker',
    );
    expect(link.hasAttribute('target')).toBe(false);
    // The icon is decorative: the link text already names the link.
    expect(link.querySelector('svg')?.getAttribute('aria-hidden')).toBe('true');

    // A footer is only a contentinfo landmark outside these elements (APG Landmark Regions).
    const footer = link.closest('footer');
    expect(footer).not.toBeNull();
    expect(footer?.closest('main, article, aside, nav, section')).toBeNull();
  });

  it('moves the active option with the arrow keys, wrapping at both ends', async () => {
    const combobox = inputLabelled(page, 'Adres');
    (await searchFor(page, 'damrak')).flush(SUGGEST_DAMRAK);
    await advance();
    expect(activeOptionOf(page, combobox)).toBeUndefined();

    pressKey(combobox, 'ArrowDown');
    await advance();
    expect(activeOptionOf(page, combobox)).toBe('Damrak 18-1, Amsterdam');

    pressKey(combobox, 'ArrowDown');
    pressKey(combobox, 'ArrowDown');
    await advance();
    expect(activeOptionOf(page, combobox)).toBe('Damrak 1, 1012LG Amsterdam');

    pressKey(combobox, 'ArrowDown');
    await advance();
    expect(activeOptionOf(page, combobox)).toBe('Damrak 18-1, Amsterdam');

    pressKey(combobox, 'ArrowUp');
    await advance();
    expect(activeOptionOf(page, combobox)).toBe('Damrak 1, 1012LG Amsterdam');
    expect(await axeViolations(page)).toEqual([]);
  });

  it.each([
    {
      how: 'the Enter key',
      choose: (combobox: HTMLInputElement) => {
        pressKey(combobox, 'ArrowDown');
        pressKey(combobox, 'Enter');
      },
    },
    { how: 'a click', choose: () => elementWithText(page, 'Damrak 18-1, Amsterdam').click() },
  ])('chooses an option with $how without searching again', async ({ choose }) => {
    const combobox = inputLabelled(page, 'Adres');
    (await searchFor(page, 'damrak')).flush(SUGGEST_DAMRAK);
    await advance();

    choose(combobox);
    await advance();
    http.expectOne(isLookupRequestFor('adr-damrak-18-1')).flush(LOOKUP_DAMRAK_18_1);
    await advance(DEBOUNCE_MS);
    http.expectNone(() => true);

    expect(combobox.value).toBe('Damrak 18-1, Amsterdam');
    expect(combobox.getAttribute('aria-expanded')).toBe('false');
    expect(optionsOf(page, combobox)).toEqual([]);
    expect(activeOptionOf(page, combobox)).toBeUndefined();
    expect(definitionOf(page, 'Straat')).toBe('Damrak');
  });

  it('closes the list with Escape and opens it again when typing', async () => {
    const combobox = inputLabelled(page, 'Adres');
    (await searchFor(page, 'damrak')).flush(SUGGEST_DAMRAK);
    await advance();

    pressKey(combobox, 'ArrowDown');
    pressKey(combobox, 'Escape');
    pressKey(combobox, 'ArrowDown');
    pressKey(combobox, 'Enter');
    await advance();

    expect(combobox.value).toBe('damrak');
    expect(combobox.getAttribute('aria-expanded')).toBe('false');
    expect(optionsOf(page, combobox)).toEqual([]);
    expect(activeOptionOf(page, combobox)).toBeUndefined();

    (await searchFor(page, 'damra')).flush(SUGGEST_DAMRAK);
    await advance();

    expect(combobox.getAttribute('aria-expanded')).toBe('true');
  });

  it('opens the closed list with Alt+ArrowDown without making an option active', async () => {
    const combobox = inputLabelled(page, 'Adres');
    (await searchFor(page, 'damrak')).flush(SUGGEST_DAMRAK);
    await advance();
    pressKey(combobox, 'Escape');
    await advance();

    pressKey(combobox, 'ArrowDown', { altKey: true });
    await advance();

    expect(combobox.getAttribute('aria-expanded')).toBe('true');
    expect(optionsOf(page, combobox)).toHaveLength(3);
    expect(activeOptionOf(page, combobox)).toBeUndefined();

    pressKey(combobox, 'ArrowDown', { altKey: true });
    await advance();

    expect(activeOptionOf(page, combobox)).toBeUndefined();
  });

  it.each(['shiftKey', 'ctrlKey', 'metaKey'] as const)(
    'leaves keys pressed with %s to the browser for editing text',
    async (modifier) => {
      const combobox = inputLabelled(page, 'Adres');
      (await searchFor(page, 'damrak')).flush(SUGGEST_DAMRAK);
      await advance();

      const down = pressKey(combobox, 'ArrowDown', { [modifier]: true });
      const enter = pressKey(combobox, 'Enter', { [modifier]: true });
      await advance();

      expect(down.defaultPrevented).toBe(false);
      expect(enter.defaultPrevented).toBe(false);
      expect(activeOptionOf(page, combobox)).toBeUndefined();
    },
  );

  it('clears the field with a second Escape', async () => {
    const combobox = inputLabelled(page, 'Adres');
    (await searchFor(page, 'damrak')).flush(SUGGEST_DAMRAK);
    await advance();

    pressKey(combobox, 'Escape');
    await advance();
    pressKey(combobox, 'Escape');
    await advance(DEBOUNCE_MS);

    expect(combobox.value).toBe('');
    expect(combobox.getAttribute('aria-expanded')).toBe('false');
  });

  it('keeps the field cleared when Escape is pressed before the debounce has passed', async () => {
    const combobox = inputLabelled(page, 'Adres');
    typeInto(combobox, 'damrak');
    await advance();

    pressKey(combobox, 'Escape');
    await advance(DEBOUNCE_MS);

    expect(combobox.value).toBe('');
    http.expectNone(isSuggestRequestFor('damrak'));
  });

  // jsdom doesn't move focus on a mouse press, so check that the press can't take it away.
  it('keeps focus in the search field when an option is pressed', async () => {
    (await searchFor(page, 'damrak')).flush(SUGGEST_DAMRAK);
    await advance();

    const press = new MouseEvent('mousedown', { bubbles: true, cancelable: true });
    elementWithText(page, 'Damrak 18-1, Amsterdam').dispatchEvent(press);

    expect(press.defaultPrevented).toBe(true);
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

  it('keeps the previous suggestions while the next search loads', async () => {
    const combobox = inputLabelled(page, 'Adres');
    (await searchFor(page, 'damrak')).flush(SUGGEST_DAMRAK);
    await advance();
    const damrak201 = elementWithText(page, 'Damrak 201, Amsterdam');

    const next = await searchFor(page, 'damrak 201 amsterdam');
    await advance();

    expect(combobox.getAttribute('aria-expanded')).toBe('true');
    expect(optionsOf(page, combobox)).toEqual([
      'Damrak 18-1, Amsterdam',
      'Damrak 201, Amsterdam',
      'Damrak 1, 1012LG Amsterdam',
    ]);

    next.flush(SUGGEST_DAMRAK_201);
    await advance();

    expect(optionsOf(page, combobox)).toEqual(['Damrak 201, Amsterdam']);
    // Only the changed options are re-rendered: the one in both results stays the same element.
    expect(elementWithText(page, 'Damrak 201, Amsterdam')).toBe(damrak201);
    expect(await axeViolations(page)).toEqual([]);
  });

  // The previous suggestions stay while the next search loads, but no longer match the typed text.
  it('does not keep an active option when typing again', async () => {
    const combobox = inputLabelled(page, 'Adres');
    (await searchFor(page, 'damrak')).flush(SUGGEST_DAMRAK);
    await advance();
    pressKey(combobox, 'ArrowDown');
    await advance();

    const next = await searchFor(page, 'damrak 201 amsterdam');
    await advance();
    expect(activeOptionOf(page, combobox)).toBeUndefined();

    pressKey(combobox, 'Enter');
    await advance();
    http.expectNone(isLookupRequestFor('adr-damrak-18-1'));
    expect(combobox.value).toBe('damrak 201 amsterdam');

    next.flush(SUGGEST_DAMRAK_201);
  });

  it('only searches from 2 characters', async () => {
    typeInto(inputLabelled(page, 'Adres'), 'd');
    await advance(DEBOUNCE_MS);
    http.expectNone(() => true);

    await searchFor(page, 'da');
  });

  it('removes the suggestions when the query drops below 2 characters', async () => {
    const combobox = inputLabelled(page, 'Adres');
    (await searchFor(page, 'da')).flush(SUGGEST_DAMRAK);
    await advance();
    expect(optionsOf(page, combobox)).toHaveLength(3);

    typeInto(combobox, 'd');
    await advance(DEBOUNCE_MS);
    http.expectNone(() => true);

    expect(combobox.getAttribute('aria-expanded')).toBe('false');
    expect(optionsOf(page, combobox)).toEqual([]);
    expect(statusMessages(page)).toEqual(['']);
  });

  // Screen readers can miss a live region that is added together with its text.
  it('has an empty status region before searching', () => {
    expect(statusMessages(page)).toEqual(['']);
  });

  it('has no axe violations before searching', async () => {
    expect(await axeViolations(page)).toEqual([]);
  });

  it.each([
    { query: 'damrak', response: SUGGEST_DAMRAK, message: '3 adressen gevonden' },
    { query: 'damrak 201 amsterdam', response: SUGGEST_DAMRAK_201, message: '1 adres gevonden' },
    { query: 'xqzvw', response: SUGGEST_NONE, message: 'Geen adressen gevonden' },
  ])('announces "$message" in the status region', async ({ query, response, message }) => {
    (await searchFor(page, query)).flush(response);
    await advance();

    expect(statusMessages(page)).toEqual([message]);
  });

  it('announces that the field was cleared with Escape', async () => {
    const combobox = inputLabelled(page, 'Adres');
    (await searchFor(page, 'damrak')).flush(SUGGEST_DAMRAK);
    await advance();

    pressKey(combobox, 'Escape');
    await advance();
    pressKey(combobox, 'Escape');
    await advance();

    expect(statusMessages(page)).toEqual(['Zoekveld gewist']);
    expect(await axeViolations(page)).toEqual([]);
  });

  it('removes the cleared message when typing again', async () => {
    const combobox = inputLabelled(page, 'Adres');
    typeInto(combobox, 'damrak');
    await advance();
    pressKey(combobox, 'Escape');
    await advance();

    typeInto(combobox, 'd');
    await advance(DEBOUNCE_MS);

    expect(statusMessages(page)).toEqual(['']);
  });

  it('announces nothing when Escape is pressed in an empty field', async () => {
    pressKey(inputLabelled(page, 'Adres'), 'Escape');
    await advance();

    expect(statusMessages(page)).toEqual(['']);
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
    expect(await axeViolations(page)).toEqual([]);
  });

  it('announces that it is searching until the results arrive', async () => {
    const request = await searchFor(page, 'damrak');
    await advance();

    expect(statusMessages(page)).toEqual(['Zoeken…']);
    expect(await axeViolations(page)).toEqual([]);

    request.flush(SUGGEST_DAMRAK);
    await advance();

    expect(statusMessages(page)).toEqual(['3 adressen gevonden']);
  });

  it('announces an error message when searching fails', async () => {
    (await searchFor(page, 'damrak')).flush(null, {
      status: 500,
      statusText: 'Internal Server Error',
    });
    await advance();

    expect(statusMessages(page)).toEqual(['Er ging iets mis bij het zoeken. Probeer het opnieuw.']);
    expect(await axeViolations(page)).toEqual([]);
  });

  it('announces an error message when the address details are not found', async () => {
    (await searchFor(page, 'damrak')).flush(SUGGEST_DAMRAK);
    await advance();

    elementWithText(page, 'Damrak 18-1, Amsterdam').click();
    await advance();
    http.expectOne(isLookupRequestFor('adr-damrak-18-1')).flush(LOOKUP_NOT_FOUND);
    await advance();

    expect(statusMessages(page)).toEqual([
      '',
      'De details van dit adres konden niet worden opgehaald. Probeer het opnieuw.',
    ]);
    expect(await axeViolations(page)).toEqual([]);
  });
});
