import { httpResource } from '@angular/common/http';
import { Component, computed, linkedSignal, output, signal } from '@angular/core';
import { debounce, form, FormField, FormRoot, minLength } from '@angular/forms/signals';
import { parseSuggestions, Suggestion, suggestRequest } from '@app/pdok/suggest';

const SEARCH_DEBOUNCE_MS = 300;
const MIN_QUERY_LENGTH = 2;
const SEARCH_ERROR = 'Er ging iets mis bij het zoeken. Probeer het opnieuw.';
const SEARCHING = 'Zoeken…';
const CLEARED = 'Zoekveld gewist';

function foundMessage(count: number): string {
  if (count === 0) {
    return 'Geen adressen gevonden';
  }
  return count === 1 ? '1 adres gevonden' : `${count} adressen gevonden`;
}

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

  private readonly results = linkedSignal({
    source: this.suggestions.snapshot,
    computation: (snapshot, previous): Suggestion[] => {
      if (snapshot.status === 'error') {
        return [];
      }
      return snapshot.status === 'loading' && previous ? previous.value : snapshot.value;
    },
  });
  private readonly closed = linkedSignal({ source: this.results, computation: () => false });
  private readonly cleared = linkedSignal({
    source: () => this.searchForm.query().controlValue(),
    computation: () => false,
  });
  protected readonly options = computed(() => (this.closed() ? [] : this.results()));
  protected readonly activeIndex = linkedSignal({
    source: () => [this.options(), this.searchForm.query().controlValue()],
    computation: (): number | undefined => undefined,
  });

  protected readonly activeDescendant = computed(() => {
    const index = this.activeIndex();
    return index === undefined ? null : `address-option-${index}`;
  });
  protected readonly expanded = computed(() => this.options().length > 0);
  // Counts the results, not the options: closing the list with Escape keeps the results.
  protected readonly statusMessage = computed(() => {
    if (this.cleared()) {
      return CLEARED;
    }
    switch (this.suggestions.status()) {
      case 'error':
        return SEARCH_ERROR;
      case 'resolved':
        return foundMessage(this.results().length);
      case 'loading':
        return SEARCHING;
      default:
        return '';
    }
  });

  protected choose(index: number): void {
    const suggestion = this.options()[index];
    this.chosen.set(suggestion.weergavenaam);
    this.searchForm.query().value.set(suggestion.weergavenaam);
    this.selected.emit(suggestion.id);
  }

  private readonly keyActions: Record<string, () => void> = {
    ArrowDown: () => this.moveActive(nextIndex),
    ArrowUp: () => this.moveActive(previousIndex),
    'Alt+ArrowDown': () => this.closed.set(false),
    Enter: () => this.chooseActive(),
    Escape: () => this.closeOrClear(),
  };

  protected onKeydown(event: KeyboardEvent): void {
    if (event.shiftKey || event.ctrlKey || event.metaKey) {
      return;
    }

    const action = this.keyActions[event.altKey ? `Alt+${event.key}` : event.key];
    if (action) {
      event.preventDefault();
      action();
    }
  }

  private moveActive(step: (index: number | undefined, count: number) => number): void {
    const count = this.options().length;
    if (count > 0) {
      this.activeIndex.update((index) => step(index, count));
    }
  }

  private chooseActive(): void {
    const index = this.activeIndex();
    if (index !== undefined) {
      this.choose(index);
    }
  }

  private closeOrClear(): void {
    if (this.expanded()) {
      this.closed.set(true);
    } else {
      this.clear();
    }
  }

  private clear(): void {
    const query = this.searchForm.query();
    // controlValue: within the debounce, value doesn't have the typed text yet.
    if (query.controlValue()) {
      query.reset('');
      this.cleared.set(true);
    }
  }
}
