import { httpResource } from '@angular/common/http';
import { Component, computed, output, signal } from '@angular/core';
import { debounce, form, FormField, FormRoot, minLength } from '@angular/forms/signals';
import { parseSuggestions, suggestRequest } from '@app/pdok/suggest';

const SEARCH_DEBOUNCE_MS = 300;
const MIN_QUERY_LENGTH = 2;
const SEARCH_ERROR = 'Er ging iets mis bij het zoeken. Probeer het opnieuw.';

@Component({
  selector: 'app-address-search',
  imports: [FormField, FormRoot],
  templateUrl: './address-search.html',
})
export class AddressSearch {
  /** The id of the chosen suggestion. */
  readonly selected = output<string>();

  private readonly search = signal({ query: '' });
  protected readonly searchError = SEARCH_ERROR;
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
}
