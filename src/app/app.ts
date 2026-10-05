import { httpResource } from '@angular/common/http';
import { Component, computed, signal } from '@angular/core';
import { debounce, form, FormField, FormRoot, minLength } from '@angular/forms/signals';
import { parseSuggestions, suggestRequest } from './pdok/suggest';
import { lookupRequest, parseAddress } from './pdok/lookup';

const SEARCH_DEBOUNCE_MS = 300;
const MIN_QUERY_LENGTH = 2;
const UNKNOWN = 'Onbekend';
const SEARCH_ERROR = 'Er ging iets mis bij het zoeken. Probeer het opnieuw.';
const LOOKUP_ERROR = 'De details van dit adres konden niet worden opgehaald. Probeer het opnieuw.';

@Component({
  selector: 'app-root',
  imports: [FormField, FormRoot],
  templateUrl: './app.html',
})
export class App {
  private readonly search = signal({ query: '' });
  protected readonly unknown = UNKNOWN;
  protected readonly searchError = SEARCH_ERROR;
  protected readonly lookupError = LOOKUP_ERROR;
  protected readonly selectedId = signal<string | undefined>(undefined);
  protected readonly searchForm = form(this.search, (path) => {
    debounce(path.query, SEARCH_DEBOUNCE_MS);
    minLength(path.query, MIN_QUERY_LENGTH);
  });
  private readonly validQuery = computed(() =>
    this.searchForm.query().valid() ? this.searchForm.query().value() : '',
  );
  protected readonly suggestions = httpResource(() => suggestRequest(this.validQuery()), {
    parse: parseSuggestions,
    defaultValue: [],
  });
  protected readonly address = httpResource(() => lookupRequest(this.selectedId()), {
    parse: parseAddress,
  });
}
