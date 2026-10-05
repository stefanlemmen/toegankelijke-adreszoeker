import { httpResource } from '@angular/common/http';
import { Component, computed, linkedSignal, output, signal } from '@angular/core';
import { debounce, form, FormField, FormRoot, minLength } from '@angular/forms/signals';
import { parseSuggestions, suggestRequest } from '@app/pdok/suggest';

const SEARCH_DEBOUNCE_MS = 300;
const MIN_QUERY_LENGTH = 2;
const SEARCH_ERROR = 'Er ging iets mis bij het zoeken. Probeer het opnieuw.';

function nextIndex(index: number | undefined, count: number): number {
  return index === undefined ? 0 : (index + 1) % count;
}

function previousIndex(index: number | undefined, count: number): number {
  return index === undefined ? count - 1 : (index - 1 + count) % count;
}

@Component({
  selector: 'app-address-search',
  imports: [FormField, FormRoot],
  templateUrl: './address-search.html',
  styleUrl: './address-search.css',
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
  private readonly chosen = signal<string | undefined>(undefined);
  private readonly validQuery = computed(() => {
    const query = this.searchForm.query();
    return query.valid() && query.value() !== this.chosen() ? query.value() : '';
  });
  protected readonly suggestions = httpResource(() => suggestRequest(this.validQuery()), {
    parse: parseSuggestions,
    defaultValue: [],
  });

  private readonly results = computed(() =>
    this.suggestions.hasValue() ? this.suggestions.value() : [],
  );
  private readonly closed = linkedSignal({ source: this.results, computation: () => false });
  protected readonly options = computed(() => (this.closed() ? [] : this.results()));
  protected readonly activeIndex = linkedSignal({
    source: this.options,
    computation: (): number | undefined => undefined,
  });

  protected readonly activeDescendant = computed(() => {
    const index = this.activeIndex();
    return index === undefined ? null : `address-option-${index}`;
  });
  protected readonly expanded = computed(() => this.options().length > 0);

  protected choose(index: number): void {
    const suggestion = this.options()[index];
    this.chosen.set(suggestion.weergavenaam);
    this.searchForm.query().value.set(suggestion.weergavenaam);
    this.selected.emit(suggestion.id);
  }

  protected onKeydown(event: KeyboardEvent): void {
    const count = this.options().length;
    const index = this.activeIndex();

    if (event.key === 'Escape') {
      if (count > 0) {
        this.closed.set(true);
      } else {
        this.searchForm.query().value.set('');
      }
      return;
    }

    if (event.key === 'ArrowDown' && event.altKey) {
      event.preventDefault();
      this.closed.set(false);
      return;
    }

    if (count === 0) {
      return;
    }

    switch (event.key) {
      case 'ArrowDown':
        this.activeIndex.set(nextIndex(index, count));
        break;
      case 'ArrowUp':
        this.activeIndex.set(previousIndex(index, count));
        break;
      case 'Enter':
        if (index === undefined) {
          return;
        }
        this.choose(index);
        break;
      default:
        return;
    }
    event.preventDefault();
  }
}
